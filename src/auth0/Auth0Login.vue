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
  <button v-if="!$auth0.isAuthenticated.value" @click="login" class="
      bg-camelot-500
      text-white
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
    " type="button">
    Log in
  </button>
  <div v-if="$auth0.isAuthenticated.value">
    <!-- show logout when authenticated -->
    <button class="
        bg-camelot-500
        text-white
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
      " @click="logout">
      Log out ( {{ $auth0.user.value === undefined ? "" : $auth0.user.value.name }} )
    </button>
    <button class="
        bg-camelot-500
        text-white
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
      " @click="verifyToken()">
      check token
    </button>
    <button v-if="false" class="
        bg-camelot-500
        text-white
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
      " @click="getSanityToken">
      get sanity token
    </button>
    <p v-if="access_token_valid" class="text-slate-700 pt-8 text-normal font-mono break-all text-justify"
      @click="showAcessToken()">
      access_token (validité: {{(access_token_payload !== undefined) && (access_token_payload.exp !== undefined) ? (new
      Date(access_token_payload.exp*1000)).toLocaleString('fr') : ""}}):<br />
      permissions
    <pre>
        {{access_token_payload !== undefined ? access_token_payload.permissions : ""}}
      </pre>
    <span class="text-xs" :class="show_access_token ? 'inline' : 'hidden'">{{
    access_token
    }}</span>
    </p>
    <p v-if="id_token_valid" class="text-slate-700 pt-8 pb-8 text-normal font-mono break-all text-justify"
      @click="showIdToken()">
      id_token (validité: {{(id_token_payload !== undefined) && (id_token_payload.exp !== undefined) ? (new
      Date(id_token_payload.exp*1000).toLocaleString('fr')) : ""}}):
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

const $auth0 = getCurrentInstance().appContext.app.config.globalProperties.$auth0 as Auth0Instance
const route = useRoute() ; route.query
const error = ref('' as string)
const error_description = ref('' as string)
const access_token = ref('' as string)
const access_token_valid = ref(null as boolean)
const access_token_payload = ref(null as jose.JWTPayload)
const id_token = ref('' as string)
const id_token_valid = ref(null as boolean)
const id_token_payload = ref(null as jose.JWTPayload)
const show_access_token = ref(null as boolean)
const show_id_token = ref(null as boolean)
const sanity_token = ref('' as string)

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
        localOnly: true,
      });
    }

    function showAcessToken():void {
      if ((access_token.value === undefined) || (access_token.value.length === 0)) {
        getToken();
      }
      show_access_token.value = true;
    }

    function showIdToken():void {
      if ((id_token.value === undefined) || (id_token.value.length === 0)) {
        getToken();
      }
      show_id_token.value = true;
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