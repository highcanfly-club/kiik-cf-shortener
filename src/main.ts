/*!
=========================================================
* © 2022 Ronan LE MEILLAT for %CLIENT_NAME%
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
import auth0conf from "@/config/auth0-conf.json";
import "@/index.css";

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
  {
    path:"/login",
    component: () => import("@/auth0/Auth0Login.vue"),
    name: "login"
  },
  {
    path: "/:pathMatch(.*)*",
    name: "default",
    redirect: (to) => {
      console.log(to);
      window.location.href = `${
        window.location.origin
      }/api/redirect?to=${to.path.substring(1)}`;
      return {};
    },
  },
] as RouteRecordRaw[];

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

const app = createApp(App);
app.use(router).mount("#app");

const REDIRECT_CALLBACK: RedirectCallback = () =>
  window.history.replaceState(
    {},
    document.title,
    `${window.location.origin}/login`
  );

app.config.globalProperties.$auth0 = initAuth0({
  onRedirectCallback: REDIRECT_CALLBACK,
  redirectUri: `${window.location.origin}/login`,
  ...auth0conf,
} as never); // never because cacheLocation:"localstorage" is typed as string but as CacheLocation = "localstorage" | "memory" in Auth0SDK
