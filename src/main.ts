/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/
import { createApp } from "vue";
import App from "@/App.vue";
import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";
import type { Auth0Instance, RedirectCallback } from "@/auth0";
import { initAuth0 } from "@/auth0";
import auth0conf from "./config/auth0-conf.json" with { type: "json" };
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import "@highcanfly-club/fontawesome/styles/fontawesome.css";
import "@/index.scss";

import enUS from "@/locales/en-US.json";

/**
 * Message schema derived from the English translation file.
 */
type MessageSchema = typeof enUS;

/**
 * Extension of Vue's ComponentCustomProperties to include $auth0 for global access.
 */
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $auth0: Auth0Instance;
  }
}

/**
 * Main application routes configuration.
 * Currently only contains the home page (IndexPage).
 */
const routes = [
  {
    path: "/",
    component: () => import("@/views/IndexPage.vue"),
    name: "index",
  },
] as RouteRecordRaw[];

import { availableLanguages } from "@/config/locales.js";

/**
 * Internationalization (i18n) setup.
 * Messages for other languages will be lazily loaded.
 */
const i18n = createI18n<
  [MessageSchema | string],
  typeof availableLanguages[number]
>({
  locale: "en-US",
  legacy: false,
  fallbackLocale: "fr-FR",
  messages: {
    "fr-FR": "", // Loaded lazily in components
    "en-US": enUS,
    "es-ES": "",
  },
});

/**
 * Vue Router instance setup.
 * Includes hash-based scrolling behavior for anchor links.
 */
const router = createRouter({
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
      };
    }
  },
  history: createWebHistory(),
  routes,
});

/**
 * Initialize Pinia for state management and create the Vue application instance.
 */
const pinia = createPinia();
const app = createApp(App);

console.log(import.meta.url)
app.use(pinia).use(i18n).use(router);

/**
 * Callback function used after successful Auth0 authentication.
 * Cleans up the URL by removing the state and code parameters.
 */
const REDIRECT_CALLBACK: RedirectCallback = () =>
  window.history.replaceState({}, document.title, `${window.location.origin}/`);

/**
 * Initialize Auth0 plugin with configuration and global property registration.
 */
app.config.globalProperties.$auth0 = initAuth0({
  onRedirectCallback: REDIRECT_CALLBACK,
  logoutParams: {
    returnTo: `window.location.origin`
  },
  ...auth0conf
} as never); // Cast as never due to slight type mismatch in Auth0 SDK for cacheLocation

/**
 * Mount the application to the DOM element with id 'app'.
 */
app.mount("#app");

