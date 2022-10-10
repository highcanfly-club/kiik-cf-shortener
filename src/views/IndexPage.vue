<!--
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
-->
<template>
  <div class="m-6 lg:m-12">
    <block-header />
    <div id="3blocks" class="mt-4 flex flex-col lg:flex-row justify-between">
      <div id="3blocks1">
        <p class="text-base font-neutra-demiitalic text-ambblue-800 tracking-widest">{{ $t('Repository') }}: <a
            href="https://github.com">{{ $t('github') }}</a></p>
        <p class="text-base font-neutra-demiitalic text-ambblue-100 tracking-widest">{{ $t('Follow') }}: <a
            href="https://github.com/highcanfly-club/kiik-cf-shortener">{{ $t('repository') }}</a></p>
        <p class="text-base font-neutra-book capitalize text-ambgrey-900">{{ $t('Hosting') }}: <a
            href="https://azure.microsoft.com">{{ $t('azure_static_web_app') }}</a></p>
        <p class="text-xs tracking-wide font-neutra-book text-ambgrey-900">{{ $t('total_cost') }}</p>
      </div>
      <div id="3blocks2" class="mt-2 lg:mt-0">
        <light-button @click="redirect('https://highcanfly.club')" text="High Can Fly" />
      </div>
      <div id="3blocks3" class="mt-2 lg:mt-0">
        <div class="flex">
          <input type="text" ref="short" class="mr-1 border-ambblue-800 text-sm font-neutra-booksc w-52 rounded-lg border-2 border-dotted" :placeholder="$t('enter_link')"/>
          <light-button @click="redirectApi(($refs.short as HTMLInputElement).value)" text="go" />
        </div>
      </div>
    </div>
    <hr-dotted />
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
import HrDotted from '@/components/ui/HRDotted.vue';
import ChangLang from '@/utilities/ChangLang.vue';
import BlockFooter from '@/components/footers/BlockFooter.vue';
import BlockHeader from '../components/headers/BlockHeader.vue';

function redirect(to: string) {
  window.location.href = to
}

function redirectApi(to: string) {
  const _to = to.startsWith('!') ? to.substring(1) : to
  window.location.href = window.location.origin +'/api/redirect?to=' + _to
}
</script>
