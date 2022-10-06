<template>
    <auth0-login />
    <div v-if="isAuthenticated()">
        <add-short-link />
        <list-short-links class="mt-4"/>
    </div>
</template>
<script setup lang="ts">
import Auth0Login from '@/auth0/Auth0Login.vue';
import AddShortLink from '@/auth0/AddShortLink.vue';
import ListShortLinks from '@/auth0/ListShortLinks.vue';
import { getAuth0 } from '@/auth0';
const $auth0 = getAuth0()

function isAuthenticated(): boolean {
    return ((typeof $auth0.user !== 'undefined') && ($auth0.isAuthenticated.value))
}
</script>