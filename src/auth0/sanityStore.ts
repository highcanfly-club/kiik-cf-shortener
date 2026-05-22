/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/
import * as sanityConfDist from '@/config/sanity-conf.json' with { type: "json" };

/**
 * Sanity dataset environment options.
 */
export enum DATASET{
    development='development',
    production='production'
}

/**
 * Configuration structure for Sanity client.
 */
export interface SanityConf {
    projectId: string;
    dataset: string;
    apiVersion: string;
    useCdn: boolean;
    preview?: boolean;
    token?: string;
}

/**
 * Exported sanity configuration initialized with distribution defaults.
 */
export const sanityConf:SanityConf = { ...sanityConfDist }

/**
 * Resets the application's global sanity configuration to its default values.
 */
export const resetSanityConfToDefaults = () => {
  (window.app.config.globalProperties.$sanityConf as SanityConf) = { ...sanityConfDist };
  (window.app.config.globalProperties.$sanityConf as SanityConf).preview = false
}

