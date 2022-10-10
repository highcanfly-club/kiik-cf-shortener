<template>
    <div id="head" class="flex justify-between">
      <div id="title">
        <div class="">
          <p class="text-3xl font-neutra-bold text-ambblue-800 tracking-widest">{{ $t('master_company') }} <span
              class="text-kiikviolet">K</span><span class="text-kiikorange">i</span><span
              class="text-kiikrose">i</span><span class="inline-block -scale-x-100 -ml-1 text-kiikvert">K</span></p>
          <p class="text-3xl font-neutra-demiitalic uppercase text-ambblue-100">{{ $t('product_name') }}</p>
        </div>
      </div>
      <div id="logo"><img class="w-32 h-32" src="@/assets/img/Logo-KiiK.svg" /></div>
    </div>
    <div id="subtitle" class="mt-4 flex">
      <h3 class="text-lg font-neutra-bold uppercase tracking-widest text-ambgrey-900 mr-2"><i
          class="fas fa-star-extra-sharp text-ambred-500 mr-1"></i>{{ $t('simple_link_shortener') }}</h3>
      <h2 class="text-lg font-neutra-demiitalic uppercase tracking-widest text-ambgrey-100">
        {{ $t('only_for_us') }}
      </h2>
    </div>
    <hr-dotted />
</template>
<script setup lang="ts">
import HrDotted from "@/components/ui/HRDotted.vue";
</script>