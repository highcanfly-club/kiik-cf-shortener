/*!
=========================================================
* © 2022 Ronan LE MEILLAT for Les Ailes du Mont-Blanc
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/
import { defineStore } from "pinia";

export const useLocaleStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});

export const getShortLocale = (longLocale: string): string => {
  return longLocale.substring(0, 2).toLocaleLowerCase();
};
