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
      <b>{{ $t('error_in_form') }}</b>
      <ul>
        <li v-for="error in formerrors" :key="error">
          <!-- eslint-disable-line -->
          {{ error }}
        </li>
      </ul>
    </h3>
    <form v-if="canAddShortUrl" @submit="checkForm" @submit.prevent="submitForm">
      <label for="longurl" class="mt-1 block text-slate-800">
        {{ $t('long_url') }}
      </label>
      <input type="text" name="longurl" v-model="longurl" id="longurl" :placeholder="$t('enter_the_long_url')"
        class="w-full bg-slate-200 rounded border text-slate-800 focus:bg-slate-400 mb-2" />
      <template v-if="expiration == 0">
        <label for="description" class="mt-1 block text-slate-800">
          {{ $t('description') }}
        </label>
        <input type="text" name="description" v-model="description" id="description"
          :placeholder="$t('enter_description')" class="
            w-full
            bg-slate-200
            rounded
            border
            text-slate-800
            focus:bg-slate-400
            mb-2
          " />
        <label for="ttl" class="m1-1 block text-slate-800">
          {{ $t('expiration') }}
        </label>
        <select name="ttl" id="input-ttl" v-model="linkTtl" class="
            text-xs
            bg-slate-200
            rounded
            border
            text-slate-800
            focus:bg-slate-400
          ">
          <option value="60">60 {{$t('second',2)}}</option>
          <option value="3600">1 {{$t('hour',1)}}</option>
          <option value="21600">6 {{$t('hour',2)}}</option>
          <option value="43200">12 {{$t('hour',2)}}</option>
          <option value="86400" selected>
            1 {{$t('day',1)}}
          </option>
          <option value="604800">1 {{$t('week',1)}}</option>
          <option value="2592000">1 {{$t('month',1)}}</option>
          <option value="15778476">6 {{$t('month',2)}}</option>
          <option value="31556952">1 {{$t('year',1)}}</option>
          <option value="2145872736">68 {{$t('year',2)}}</option>
        </select>
        <div v-if="!formVerified" class="mt-4">
          <light-button :text="$t('add')" type="submit" />
          <hr-dotted />
        </div>
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

import { getCurrentInstance, ref } from "vue";
import { isAllowed, AUTH0_PERMISSION } from "./TokenHelper";
import jwks from "@/config/jwks.json";
import { Auth0Instance } from "./instance";
import LightButton from "@/components/ui/LightButton.vue";
import HrDotted from "@/components/ui/HRDotted.vue";

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

const checkForm = function (e: Event): boolean {
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
        "Auth0-Authorization": `Bearer ${token.value}`, // duplicate because azure replace authorization header with its own
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
