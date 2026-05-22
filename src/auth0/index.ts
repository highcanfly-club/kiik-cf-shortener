/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/

import { getCurrentInstance } from 'vue'
import type{ Auth0Instance } from './instance'

export * from './instance'
export * from './guard'

/**
 * Global helper to access the Auth0 instance from any component.
 * Retrieves it from the Vue application's global properties.
 * @returns The initialized Auth0Instance.
 */
export const getAuth0 = () => { return getCurrentInstance()?.appContext.app.config.globalProperties.$auth0 as Auth0Instance}