<template>
  <div class="overflow-scroll">
    <table class="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="py-3 px-6">{{ $t('short-link') }}</th>
          <th scope="col" class="py-3 px-6">{{ $t('target') }}</th>
          <th scope="col" class="py-3 px-6">{{ $t('description') }}</th>
          <th scope="col" class="py-3 px-6">{{ $t('expiration') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700" v-for="data in kvData" :key="data.name">
          <td scope="row" class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"><a
              :href="`${canonical}!${data.name}`">!{{ data.name }}</a></td>
          <td class="py-4 px-6">{{ data.value }}</td>
          <td class="py-4 px-6">{{ data.description }}</td>
          <td class="py-4 px-6">{{`${(new
          Date(data.expiration)).toLocaleDateString('fr-FR')}`
          }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { isAllowed, AUTH0_PERMISSION } from "./TokenHelper";
import jwks from "@/config/jwks.json";
import { getAuth0 } from '@/auth0';

interface kvStoreElement {
  name: string;
  value: string;
  description: string;
  expiration: number;
}
type kvStore = kvStoreElement[]

const canonical = new URL(window.location.origin);
const canListShortUrl = ref(false);
const kvData = ref(null as kvStore);
const $auth0 = getAuth0()

onMounted(
  () => {
    $auth0
      .getTokenSilentlyVerbose()
      .then((token: { id_token: string; access_token: string }) => {
        isAllowed(
          token.access_token,
          jwks.domain,
          Date.now() / 1000,
          AUTH0_PERMISSION.list_all_short_url
        )
          .then((hasRight) => {
            canListShortUrl.value = hasRight;
          })
          .then(() => {
            fetch("/api/list-short-url", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.access_token}`,
              },
              body: JSON.stringify({}),
            })
              .then((res: Response) => {
                return res.json();
              })
              .then((data: kvStore) => {
                console.log(data);
                kvData.value = data;
              });
          });
      });
  }
)


</script>
