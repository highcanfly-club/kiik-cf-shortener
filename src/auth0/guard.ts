/*!
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
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

export function authGuard (
  callback: (
    isAuthenticated: boolean,
    to: Parameters<NavigationGuard>[0],
    from: Parameters<NavigationGuard>[1]
  ) => ReturnType<NavigationGuard>
): NavigationGuard {
  return async (to, from) => {
    const { isAuthenticated, initializationCompleted } = useAuth0()

    await initializationCompleted()

    return callback(isAuthenticated.value, to, from)
  }
}

export const redirectToLoginGuard = authGuard(async (isAuthenticated, to) => {
  const { loginWithRedirect } = useAuth0()

  // If the user is authenticated, continue with the route
  if (isAuthenticated) {
    return
  }

  // Otherwise, log in
  await loginWithRedirect({ appState: { targetUrl: to.fullPath } })
})
