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
          <p class="text-3xl font-neutra-bold text-ambblue-800 tracking-widest">SCTG <span
              class="text-[#41195E]">K</span><span class="text-[#CB3F1F]">i</span><span
              class="text-[#C1091E]">i</span><span class="inline-block -scale-x-100 -ml-1 text-[#237331]">K</span></p>
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
        <p class="text-base font-neutra-demiitalic text-ambblue-800 tracking-widest">Repo: <a
            href="https://github.com">Github</a></p>
        <p class="text-base font-neutra-demiitalic text-ambblue-100 tracking-widest">Follow: <a
            href="https://github.com/highcanfly-club/kiik-cf-shortener">kiik-cf-shortener</a></p>
        <p class="text-base font-neutra-book capitalize text-ambgrey-900">Hosting: <a
            href="https://azure.microsoft.com">azure
            static web app</a></p>
        <p class="text-xs tracking-wide font-neutra-book text-ambgrey-900">Total cost 0€</p>
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
    <div id="footer" class="flex justify-end relative">
      <div class="mt-4 border-r-6 border-b-6 border-ambblue-100 px-12 py-2  w-fit absolute right-32 z-2">
        <div class="font-neutra-demi uppercase text-ambblue-100">contact</div>
        <div class="font-neutra-demiitalic  text-ambblue-800"><a href="mailto:info@kiik.cf">info@kiik.cf</a></div>
      </div>
      <div class="mt-4 border-l-6 border-b-6 border-ambblue-100 px-4 py-1 w-fit h-fit bg-white absolute right-0 z-3 ">
        <div class="font-neutra-demi text-ambblue-100">© Ronan Le Meillat</div>
      </div>
      <div class="mt-4 px-3 py-1 w-32 h-fit absolute right-0 top-10 z-10 ">
        <div class="font-neutra-booksc text-justify leading-tight text-xxs tracking-wide text-ambgrey-200">keep in mind that this is provided as is for education only under MIT license</div>
      </div>
    </div>
  </div>

</template>
  
<script setup lang="ts">
import LightButton from '@/components/ui/LightButton.vue';
import ShortenerCard from '@/components/cards/ShortenerCard.vue';
import HRDotted from '../components/ui/HRDotted.vue';

function redirect(to: string) {
  window.location.href = to
}
</script>
