/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

