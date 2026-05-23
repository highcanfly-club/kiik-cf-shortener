/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

