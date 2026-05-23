<!--
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
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

/**
 * Checks if the user is currently authenticated via Auth0.
 * @returns true if authenticated and user data is available.
 */
function isAuthenticated(): boolean {
    return ((typeof $auth0.user !== 'undefined') && ($auth0.isAuthenticated.value))
}
</script>