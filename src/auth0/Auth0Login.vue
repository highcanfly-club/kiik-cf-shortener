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
  <!-- Check that the SDK client is not currently loading before accessing is methods -->
  <!-- show login when not authenticated -->
  <div v-if="error">{{ error }}: {{ error_description }}</div>
  <div  v-if="!$auth0.isAuthenticated.value">
    <light-button @click="login" :text="$t('log_in')"/>
  </div>
  <div  v-if="$auth0.isAuthenticated.value">
    <light-button class="mr-4" @click="logout" :text="`${$t('log_out')} ( ${ $auth0.user.value === undefined ? '' : $auth0.user.value.name } )`"/>
    <span v-if="!access_token_valid">
      <light-button class="mr-4" @click="verifyToken()" :text="$t('check_token')"/>
    </span>
    <span v-else>
      <light-button class="mr-4" @click="access_token_valid = id_token_valid = !access_token_valid" :text="$t('mask_token')"/>
    </span>
  </div>
  <div v-if="$auth0.isAuthenticated.value">

    <p v-if="access_token_valid" class="text-slate-700 pt-8 text-normal font-mono break-all text-justify"
      @click="toggleAcessToken()">
      access_token ({{ $t('validity') }}: {{(access_token_payload !== undefined) && (access_token_payload.exp !== undefined) ? (new
      Date(access_token_payload.exp*1000)).toLocaleString(locale as string) : ""}}):<br />
      {{ $t('permissions') }}
    <pre>
        {{access_token_payload !== undefined ? access_token_payload.permissions : ""}}
      </pre>
    <span class="text-xs" :class="show_access_token ? 'inline' : 'hidden'">{{
    access_token
    }}</span>
    </p>
    <p v-if="id_token_valid" class="text-slate-700 pt-8 pb-8 text-normal font-mono break-all text-justify"
      @click="toggleIdToken()">
      id_token (validité: {{(id_token_payload !== undefined) && (id_token_payload.exp !== undefined) ? (new
      Date(id_token_payload.exp*1000).toLocaleString(locale as string)) : ""}}):
      <span class="text-xs" :class="show_id_token ? 'inline' : 'hidden'">{{
      id_token
      }}</span>
    </p>
    <p v-if="sanity_token.length" class="text-slate-700 pt-8 pb-8 text-normal font-mono break-all text-justify">
      sanity_token : <span class="text-xs">{{sanity_token}}</span>
    </p>
  </div>
</template>
<script setup lang="ts">
import { getCurrentInstance, ref } from "vue";
import { GetTokenSilentlyVerboseResponse } from "@auth0/auth0-spa-js";
import { useRoute } from "vue-router";
import {
  getCustomClaim,
  verifyTokenAsync,
  oAuthTokenType,
} from "./TokenHelper";
import * as jose from "jose";
import type { Auth0Instance } from "./instance";
import LightButton from "@/components/ui/LightButton.vue";
import { useI18n } from 'vue-i18n'


const $auth0 = getCurrentInstance().appContext.app.config.globalProperties.$auth0 as Auth0Instance
const route = useRoute() ; route.query
const error = ref('' as string)
const error_description = ref('' as string)
const access_token = ref('' as string)
const access_token_valid = ref(false as boolean)
const access_token_payload = ref(null as jose.JWTPayload)
const id_token = ref('' as string)
const id_token_valid = ref(false as boolean)
const id_token_payload = ref(null as jose.JWTPayload)
const show_access_token = ref(false)
const show_id_token = ref(false)
const sanity_token = ref('' as string)
const { locale } = useI18n({ useScope: 'global' })

if (
      route !== undefined &&
      route.query !== undefined &&
      route.query.error !== undefined
    ) {
      error.value = route.query.error as string;
      error_description.value = route.query.error_description === undefined ? "" : route.query.error_description as string;
      console.log(route.query);
    }

    function login():void {
       $auth0.loginWithRedirect();
    }

    // Log the user out
    function logout():void {
       $auth0.logout({
        logoutParams:{
          returnTo: window.location.origin
        }
      });
    }

    function toggleAcessToken():void {
      if ((access_token.value === undefined) || (access_token.value.length === 0)) {
        getToken();
      }
      show_access_token.value = !show_access_token.value;
    }

    function toggleIdToken():void {
      if ((id_token.value === undefined) || (id_token.value.length === 0)) {
        getToken();
      }
      show_id_token.value = !show_id_token.value;
    }

    function getToken():void {
       $auth0
        .getTokenSilentlyVerbose()
        .then((tokens: GetTokenSilentlyVerboseResponse) => {
          access_token.value = tokens.access_token;
          id_token.value = tokens.id_token;
        });
    }

    function verifyToken():void {
      verifyTokenAsync(
        $auth0.getTokenSilentlyVerbose(),
        oAuthTokenType.access_token,
        undefined,
        Date.now() / 1000
      ).then((jwt) => {
        access_token_valid.value = jwt !== null;
        console.log(jwt);
        access_token_payload.value = jwt.payload;
        console.log(access_token_payload.value);
      });
      verifyTokenAsync(
         $auth0.getTokenSilentlyVerbose(),
        oAuthTokenType.id_token,
        undefined,
        Date.now() / 1000
      ).then((jwt) => {
        id_token_valid.value = jwt !== null;
        console.log(jwt);
        id_token_payload.value = jwt.payload;
        console.log(id_token_payload.value);
      });
    }

    function getSanityToken() {
      getCustomClaim(
        "sanity_token",
         $auth0.getTokenSilentlyVerbose(),
        Date.now() / 1000
      ).then((claim) => {
        console.log(claim);
        sanity_token.value = claim as string;
      });
      verifyTokenAsync(
         $auth0.getTokenSilentlyVerbose(),
        oAuthTokenType.access_token,
        undefined,
        Date.now() / 1000
      ).then((jwt) => {
        console.log(jwt);
      });
    }
</script>
