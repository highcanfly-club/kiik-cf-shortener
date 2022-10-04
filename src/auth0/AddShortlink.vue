<!--
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
-->
<template>
  <div>
    <h3 class="text-slate-800" v-if="formerrors.length">
      <b>Formulaire erronné</b>
      <ul>
        <li v-for="error in formerrors" :key="error">
          <!-- eslint-disable-line -->
          {{ error }}
        </li>
      </ul>
    </h3>
    <form v-if="canAddShortUrl" @submit="checkForm" @submit.prevent="submitForm">
      <label for="longurl" class="mb-3 block text-slate-800">
        Longue URL
      </label>
      <input type="text" name="longurl" v-model="longurl" id="longurl" placeholder="Entrez l'URL longue"
        class="w-full bg-slate-200 rounded border text-slate-800 focus:bg-slate-400" />
      <template v-if="expiration == 0">
        <label for="description" class="mb-3 block text-slate-800">
          Description
        </label>
        <input type="text" name="description" v-model="description" id="description" placeholder="Entrez la description"
          class="
            w-full
            bg-slate-200
            rounded
            border
            text-slate-800
            focus:bg-slate-400
          " />
        <label for="ttl" class="mb-3 block text-slate-800">
          Expiration
        </label>
        <select name="ttl" id="input-ttl" v-model="linkTtl" class="
            text-xs
            bg-slate-200
            rounded
            border
            text-slate-800
            focus:bg-slate-400
          ">
          <option value="3600">1 heure</option>
          <option value="21600">6 heures</option>
          <option value="43200">12 heures</option>
          <option value="86400" selected>
            1 jour
          </option>
          <option value="604800">1 semaine</option>
          <option value="2592000">1 mois</option>
          <option value="15778476">6 mois</option>
          <option value="31556952">1 an</option>
          <option value="2145872736">68 ans</option>
        </select>
        <button v-if="!formVerified" type="submit" class="
            bg-camelot-500
            text-slate-800
            active:bg-slate-50
            text-xs
            font-bold
            uppercase
            px-4
            py-2
            rounded
            shadow
            hover:shadow-md
            outline-none
            focus:outline-none
            lg:mr-1 lg:mb-0
            ml-3
            mb-3
            ease-linear
            transition-all
            duration-150
          ">
          Ajouter
        </button>
      </template>
      <template v-else>
        <router-link :to="`/!${slug}`">{{
        `${canonical}!${slug}`
        }}</router-link>
      </template>
    </form>
  </div>
</template>
<script setup lang="ts">

import { defineComponent, getCurrentInstance, ref } from "vue";
import { isAllowed, AUTH0_PERMISSION } from "./TokenHelper";
import jwks from "@/config/jwks.json";
import { Auth0Instance } from "./instance";

const $auth0 = getCurrentInstance().appContext.app.config.globalProperties.$auth0 as Auth0Instance
const token = ref("");
const canAddShortUrl = ref(false);
const formerrors = ref([] as string[]);
const longurl = ref("");
const description = ref("");
const linkTtl = ref("86400");
const formVerified = ref(false);
const slug = ref("");
const expiration = ref(0);
const canonical = new URL(window.location.origin);

$auth0.getTokenSilentlyVerbose().then((_token: { id_token: string, access_token: string }) => {
  token.value = _token.access_token;
  isAllowed(
    _token.access_token,
    jwks.domain,
    Date.now() / 1000,
    AUTH0_PERMISSION.add_short_url
  ).then((hasRight) => {
    canAddShortUrl.value = hasRight;
  }).catch(error => {
    console.log(error)
  });
}).catch(error => {
  console.log(error)
});

const isValidHttpUrl = function (string: string): boolean {
  let url: URL;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

const checkForm = function (e:Event): boolean {
  if (
    longurl.value.length &&
    isValidHttpUrl(longurl.value) &&
    description.value.length
  ) {
    formVerified.value = true;
    return true;
  }
  if (!longurl.value.length) {
    formerrors.value.push("URL longue manquante");
  }
  if (!description.value.length) {
    formerrors.value.push("Description manquante");
  }
  if (!isValidHttpUrl(longurl.value)) {
    formerrors.value.push("Ne semble pas être une URL");
  }
  e.preventDefault();
}

const submitForm = function (): void {

  if (!formerrors.value.length && formVerified.value && canAddShortUrl.value) {
    fetch("/api/add-short-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        url: longurl.value,
        ttl: linkTtl.value,
        description: description.value,
      }),
    })
      .then((res: Response) => {
        return res.json();
      })
      .then(
        (data: { slug: string; shortened: string; expiration: number }) => {
          console.log(data);
          if (data.slug !== undefined && data.slug.length) {
            slug.value = data.slug;
            expiration.value = data.expiration;
          }
        }
      );
  }
}
</script>
