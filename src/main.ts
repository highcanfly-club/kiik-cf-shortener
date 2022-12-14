/*!
=========================================================
* © 2022 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/
import { createApp, getCurrentInstance } from "vue";
import App from "@/App.vue";
import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";
import type { Auth0Instance, RedirectCallback } from "@/auth0";
import { initAuth0 } from "@/auth0";
import auth0conf from "@/config/auth0-conf.json";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import "@/index.scss";

import enUS from "@/locales/en-US.json";

type MessageSchema = typeof enUS;
type Messages = { "fr-FR"?: MessageSchema; "en-US"?: MessageSchema };

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $auth0: Auth0Instance;
  }
}

const routes = [
  {
    path: "/",
    component: () => import("@/views/IndexPage.vue"),
    name: "index",
  },
] as RouteRecordRaw[];

import { availableLanguages } from "@/config/locales.js";
const i18n = createI18n<
  [MessageSchema | string],
  typeof availableLanguages[number]
>({
  locale: "en-US",
  legacy: false,
  fallbackLocale: "fr-FR",
  messages: {
    "fr-FR": "", //will be lazily loaded in HeaderMain/changeLang(locale)
    "en-US": enUS,
    "es-ES": "",
  },
});

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

const pinia = createPinia();
const app = createApp(App);

console.log(import.meta.url)
app.use(pinia).use(i18n).use(router);
app.mount("#app");

const REDIRECT_CALLBACK: RedirectCallback = () =>
  window.history.replaceState({}, document.title, `${window.location.origin}/`);

app.config.globalProperties.$auth0 = initAuth0({
  onRedirectCallback: REDIRECT_CALLBACK,
  logoutParams: {
    returnTo: `window.location.origin`
  },
  ...auth0conf
} as never); // never because cacheLocation:"localstorage" is type as string but as CacheLocation = "localstorage" | "memory" in Auth0SDK
