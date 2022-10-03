/*!
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/
import * as sanityConfDist from '@/config/sanity-conf.json'

export enum DATASET{
    development='development',
    production='production'
}
export interface SanityConf {
    projectId: string;
    dataset: string;
    apiVersion: string;
    useCdn: boolean;
    preview?: boolean;
    token?: string;
}

export const sanityConf:SanityConf = { ...sanityConfDist }

export const resetSanityConfToDefaults = () => {
  (window.app.config.globalProperties.$sanityConf as SanityConf) = { ...sanityConfDist };
  (window.app.config.globalProperties.$sanityConf as SanityConf).preview = false
}
