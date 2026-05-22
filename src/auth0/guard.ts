/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/
import { useAuth0 } from './instance'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- optional interface, will gracefully degrade to `any` if `vue-router` isn't installed
import type { NavigationGuard } from 'vue-router'

/**
 * Higher-order function to create a NavigationGuard with Auth0 support.
 * @param callback - Logic to execute within the guard.
 * @returns A Vue Router NavigationGuard.
 */
export function authGuard (
  callback: (
    isAuthenticated: boolean,
    to: Parameters<NavigationGuard>[0],
    from: Parameters<NavigationGuard>[1]
  ) => ReturnType<NavigationGuard>
): NavigationGuard {
  return async (to, from) => {
    const { isAuthenticated, initializationCompleted } = useAuth0()

    // Ensure the SDK is initialized before checking authentication
    await initializationCompleted()

    return callback(isAuthenticated.value, to, from)
  }
}

/**
 * Navigation guard that redirects unauthenticated users to the Auth0 login page.
 */
export const redirectToLoginGuard = authGuard(async (isAuthenticated, to) => {
  const { loginWithRedirect } = useAuth0()

  // If the user is authenticated, continue with the route
  if (isAuthenticated) {
    return
  }

  // Otherwise, log in and save the target URL for post-login redirect
  await loginWithRedirect({ appState: { targetUrl: to.fullPath } })
})

