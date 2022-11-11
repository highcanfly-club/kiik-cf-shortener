<template>
    <div id="footer" class="flex justify-between relative">
        <div class="mt-4 border-r-6 border-b-6 border-ambblue-100 px-12 py-2  w-fit absolute right-32 z-2">
            <div class="font-neutra-demi uppercase text-ambblue-100">{{ $t('contact') }}</div>
            <div class="font-neutra-demiitalic  text-ambblue-800"><a :href="`mailto:${$t('email')}`">{{ $t('email')
            }}</a></div>
        </div>
        <div class="mt-4 border-l-6 border-b-6 border-ambblue-100 px-4 py-1 w-fit h-fit bg-white absolute right-0 z-3 ">
            <div class="font-neutra-demi text-ambblue-100">{{ $t('c_ronan_le_meillat') }}</div>
        </div>
        <div class="mt-4 px-3 py-1 w-32 h-fit absolute right-0 top-10 z-10 ">
            <div id="disclaimer" class="font-neutra-booksc leading-tight text-xxs tracking-wide text-ambgrey-200"
                @mouseover="disclaimerVisible = false" @mouseleave="disclaimerVisible = true">
                <div v-if="disclaimerVisible" class="text-justify">{{
                        $t('disclaimer')
                }}</div>
                <div v-else>
                    Vite:{{ versions.viteVersion }} Vue:{{ versions.vueVersion }} CosmosDB:{{ versions.cosmosDBSdkVersion }}
                    Auth0:{{ versions.auth0SdkVersion }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import versions from "@/config/versions.json"
import { ref } from "vue";

const disclaimerVisible = ref<boolean>(true)
</script>