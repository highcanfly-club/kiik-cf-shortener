<!--
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
-->
<template>
  <div class="m-12">
    <block-header />
    <div id="3blocks" class="mt-4 flex justify-between">
      <div id="3blocks1">
        <p class="text-base font-neutra-demiitalic text-ambblue-800 tracking-widest">{{ $t('Repository') }}: <a
            href="https://github.com">{{ $t('github') }}</a></p>
        <p class="text-base font-neutra-demiitalic text-ambblue-100 tracking-widest">{{ $t('Follow') }}: <a
            href="https://github.com/highcanfly-club/kiik-cf-shortener">{{ $t('repository') }}</a></p>
        <p class="text-base font-neutra-book capitalize text-ambgrey-900">{{ $t('Hosting') }}: <a
            href="https://azure.microsoft.com">{{ $t('azure_static_web_app') }}</a></p>
        <p class="text-xs tracking-wide font-neutra-book text-ambgrey-900">{{ $t('total_cost') }}</p>
      </div>
      <div id="3blocks2">
        <light-button @click="redirect('https://highcanfly.club')" text="High Can Fly" />
      </div>
      <div id="3blocks3">
        <light-button @click="redirect('https://github.com/highcanfly-club/kiik-cf-shortener')" text="Github repo" />
      </div>
    </div>
    <h-r-dotted />
    <div id="shortenerlogik" class="mt-4">
      <shortener-card />
    </div>
    <block-footer />
    <div class="mt-2 ml-2 text-ambgrey-100 text-xs font-neutra-demi uppercase absolute top-0 left-0">
      <chang-lang />
    </div>
  </div>

</template>
  
<script setup lang="ts">
import LightButton from '@/components/ui/LightButton.vue';
import ShortenerCard from '@/components/cards/ShortenerCard.vue';
import HRDotted from '../components/ui/HRDotted.vue';
import ChangLang from '@/utilities/ChangLang.vue';
import BlockFooter from '@/components/footers/BlockFooter.vue';
import BlockHeader from '../components/headers/BlockHeader.vue';

function redirect(to: string) {
  window.location.href = to
}
</script>
