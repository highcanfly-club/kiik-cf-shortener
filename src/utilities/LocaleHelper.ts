/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for Les Ailes du Mont-Blanc
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/
import { defineStore } from "pinia";

/**
 * Pinia store for tracking locale-related state, such as change count.
 */
export const useLocaleStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});

/**
 * Extracts the short language code from a long locale string.
 * Example: 'fr-FR' -> 'fr'
 * @param longLocale - The full locale string.
 * @returns The lowercase short language code.
 */
export const getShortLocale = (longLocale: string): string => {
  return longLocale.substring(0, 2).toLocaleLowerCase();
};

