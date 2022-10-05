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
    <div id="head" class="flex justify-between">
      <div id="title">
        <div class="">
          <p class="text-3xl font-neutra-bold uppercase text-ambblue-800 tracking-widest">sctg KiiK</p>
          <p class="text-3xl font-neutra-demiitalic uppercase text-ambblue-100">shortener</p>
        </div>
      </div>
      <div id="logo"><img class="w-32 h-32" src="@/assets/img/Logo-KiiK.svg" /></div>
    </div>
    <div id="subtitle" class="mt-4 flex">
      <h3 class="text-lg font-neutra-bold uppercase tracking-widest text-ambgrey-900 mr-2"><i
          class="fas fa-star-extra-sharp text-ambred-500 mr-1"></i>Simple link shortener</h3>
      <h2 class="text-lg font-neutra-demiitalic uppercase tracking-widest text-ambgrey-100">
        only for us…
      </h2>
    </div>
    <h-r-dotted />
    <div id="3blocks" class="mt-4 flex justify-between">
      <div id="3blocks1">
        <p class="text-base font-neutra-demiitalic text-ambblue-800 tracking-widest"><a href="https://github.com">Github</a></p>
        <p class="text-base font-neutra-demiitalic text-ambblue-100 tracking-widest"><a href="https://github.com/highcanfly-club/kiik-cf-shortener">kiik-cf-shortener</a></p>
        <p class="text-base font-neutra-book capitalize text-ambgrey-900"><a href="https://azure.microsoft.com">azure static web app</a></p>
      </div>
      <div id="3blocks1"><light-button @click="redirect('https://highcanfly.club')" text="High Can Fly"/></div>
      <div id="3blocks1"><light-button @click="redirect('https://github.com/highcanfly-club/kiik-cf-shortener')" text="Github repo"/></div>
    </div>
    <h-r-dotted />
    <div id="shortenerlogik" class="mt-4">
    <shortener-card />
  </div>
  </div>

</template>
  
<script setup lang="ts">
import LightButton from '@/components/ui/LightButton.vue';
import ShortenerCard from '@/components/cards/ShortenerCard.vue';
import HRDotted from '../components/ui/HRDotted.vue';

function redirect(to:string){
  window.location.href = to
}
</script>