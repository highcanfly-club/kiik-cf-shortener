// adapted from https://github.com/dreamonkey/vue-auth0/tree/main/src

import {
  createAuth0Client,
  Auth0Client as Auth0ClientClass,
  Auth0ClientOptions,
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
  User
} from '@auth0/auth0-spa-js'
import { invoke, until } from '@vueuse/core'
import { reactive, ToRefs, toRefs } from 'vue'

/**
 * The user data object returned from Auth0,
 * you can augment this interface to remove fields optionality
 * and add custom properties.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Auth0User extends User {}

// Extract public interface from class definition
// Not doing this would result into a conflict
// due to public/private class members mismatch
// See: https://stackoverflow.com/a/64754408/7931540
type Auth0Client = Pick<Auth0ClientClass, keyof Auth0ClientClass>;

interface Auth0State {
  auth0Client: Auth0Client;
  loading: boolean;
  isAuthenticated: boolean;
  // Using `user?: Auth0User` would results into `user: Ref<Auth0User | undefined> | undefined`
  // instead of `user: Ref<Auth0User | undefined>`
  user: Auth0User | undefined;
  popupOpen: boolean;
  // TODO: check which types this should actually have
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}
type InitializationCompletedHookCallback = (
  callback: () => void | Promise<void>
) => void;
type InitializationCompleted = () => Promise<void>;
type LoginHookCallback = (
  callback: (user: Auth0User) => void | Promise<void>
) => void;
type LogoutHookCallback = (callback: () => void | Promise<void>) => void;

export interface Auth0Instance
  extends ToRefs<Auth0State>,
    Pick<
      Auth0Client,
      | 'loginWithPopup'
      | 'handleRedirectCallback'
      | 'loginWithRedirect'
      | 'getIdTokenClaims'
      | 'getTokenWithPopup'
      | 'logout'
    > {
  // getTokenSilently got an overload since 1.19.x and cannot be easily wrapped since then,
  // it has been split into 2 different methods
  getTokenSilently: (options?: GetTokenSilentlyOptions) => Promise<string>;
  getTokenSilentlyVerbose: (
    options?: GetTokenSilentlyOptions
  ) => Promise<GetTokenSilentlyVerboseResponse>;
  // Custom hooks
  onInitializationCompleted: InitializationCompletedHookCallback;
  initializationCompleted: InitializationCompleted;
  onLogin: LoginHookCallback;
  onLogout: LogoutHookCallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RedirectCallback<T = any> = (appState?: T) => void;

interface Auth0InitConfig<AppStateType> extends Auth0ClientOptions {
  onRedirectCallback?: RedirectCallback<AppStateType>;
  redirectUri?: string;
}

/** Define a default action to perform after authentication */
const DEFAULT_REDIRECT_CALLBACK: RedirectCallback = () =>
  window.history.replaceState({}, document.title, window.location.pathname)

let _instance: Auth0Instance | undefined

/** Returns the current instance of the SDK */
export function useAuth0 () {
  if (!_instance) {
    throw new Error(
      'Auth0 instance has not been initialized yet, but sure to call initAuth0 first'
    )
  }

  return _instance
}

/** Creates an instance of the Auth0 SDK. If one has already been created, it returns that instance */
export function initAuth0<AppStateType> ({
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  redirectUri = window.location.origin,
  ...options
}: Auth0InitConfig<AppStateType>) {
  if (_instance) {
    return _instance
  }

  const state = reactive<Auth0State>({
    // `auth0Client` should be optional as it's initialized into the IIFE,
    // but it'll always be defined when called via the instance,
    // setting it optional would mean dealing with a lot of linting false positives
    auth0Client: undefined as unknown as Auth0Client,
    loading: true,
    isAuthenticated: false,
    user: undefined,
    popupOpen: false,
    error: undefined
  })

  /** Instantiate the SDK client */
  void (async () => {
    // Create a new instance of the SDK client using members of the given options object
    const authOptions: Auth0ClientOptions = {...options,clientId: options.clientId}
    authOptions.authorizationParams.redirect_uri = redirectUri
    state.auth0Client = await createAuth0Client(authOptions)

    try {
      // If the user is returning to the app after authentication..
      if (
        window.location.search.includes('code=') &&
        window.location.search.includes('state=')
      ) {
        // handle the redirect and retrieve tokens
        const result = await state.auth0Client.handleRedirectCallback()

        state.error = undefined

        // Notify subscribers that the redirect callback has happened, passing the appState
        // (useful for retrieving any pre-authentication state)
        onRedirectCallback(result.appState as AppStateType | undefined)
      }
    } catch (e) {
      state.error = e
    } finally {
      // Initialize our internal authentication state
      state.isAuthenticated = await state.auth0Client.isAuthenticated()
      state.user = await state.auth0Client.getUser()
      state.loading = false
    }
  })()

  /** Authenticates the user using a popup window */
  const loginWithPopup: Auth0Client['loginWithPopup'] = async (
    options,
    config
  ) => {
    state.popupOpen = true

    try {
      await state.auth0Client.loginWithPopup(options, config)
      state.user = await state.auth0Client.getUser()
      state.isAuthenticated = await state.auth0Client.isAuthenticated()
      state.error = undefined
    } catch (e) {
      state.error = e
      console.error(e)
    } finally {
      state.popupOpen = false
    }

    state.user = await state.auth0Client.getUser()
    state.isAuthenticated = true
  }

  /** Handles the callback when logging in using a redirect */
  const handleRedirectCallback: Auth0Client['handleRedirectCallback'] =
    async () => {
      state.loading = true
      try {
        const result = await state.auth0Client.handleRedirectCallback()
        state.user = await state.auth0Client.getUser()
        state.isAuthenticated = true
        state.error = undefined
        return result
      } catch (e) {
        state.error = e
        // Won't be compliant with `Auth0Client['handleRedirectCallback']` without a returned object
        return {}
      } finally {
        state.loading = false
      }
    }

  /** Authenticates the user using the redirect method */
  const loginWithRedirect: Auth0Client['loginWithRedirect'] = (options) => {
    return state.auth0Client.loginWithRedirect(options)
  }

  /** Returns all the claims present in the ID token */
  const getIdTokenClaims: Auth0Client['getIdTokenClaims'] = () => {
    return state.auth0Client.getIdTokenClaims()
  }

  /** Returns the access token. If the token is invalid or missing, a new one is retrieved */
  const getTokenSilently = (options: GetTokenSilentlyOptions = {}) => {
    return state.auth0Client.getTokenSilently({
      ...options,
      detailedResponse: false
    })
  }

  /** Fetches a new access token and returns the response from the /oauth/token endpoint, omitting the refresh token */
  const getTokenSilentlyVerbose = (options: GetTokenSilentlyOptions = {}) => {
    return state.auth0Client.getTokenSilently({
      ...options,
      detailedResponse: true
    })
  }

  /** Gets the access token using a popup window */
  const getTokenWithPopup: Auth0Client['getTokenWithPopup'] = (options) => {
    return state.auth0Client.getTokenWithPopup(options)
  }
  /** Logs the user out and removes their session on the authorization server */
  const logout: Auth0Client['logout'] = async (options) => {
    await state.auth0Client.logout(options)
    state.isAuthenticated = false
    state.user = undefined
  }

  const onInitializationCompleted: InitializationCompletedHookCallback = (
    callback
  ) => {
    void invoke(async () => {
      await until(() => state.loading).toBe(false)
      await callback()
    })
  }

  const onLogin: LoginHookCallback = (callback) => {
    void invoke(async () => {
      await until(() => state.isAuthenticated && !!state.user).toBe(true)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await callback(state.user!)
    })
  }

  // We leverage onLogin hook to make sure the logout took place after a login
  const onLogout: LogoutHookCallback = (callback) => {
    onLogin(async () => {
      await until(() => !state.isAuthenticated && !state.user).toBe(true)
      await callback()
    })
  }

  const initializationCompleted: InitializationCompleted = () =>
    new Promise((resolve) => {
      onInitializationCompleted(() => resolve())
    })

  _instance = {
    loginWithPopup,
    handleRedirectCallback,
    loginWithRedirect,
    getIdTokenClaims,
    getTokenSilently,
    getTokenSilentlyVerbose,
    getTokenWithPopup,
    logout,
    onInitializationCompleted,
    initializationCompleted,
    onLogin,
    onLogout,
    ...toRefs(state)
  }

  return _instance
}
