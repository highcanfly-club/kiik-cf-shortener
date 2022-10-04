/*!
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
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

export const getAuth0 = () => { return getCurrentInstance().appContext.app.config.globalProperties.$auth0 as Auth0Instance}