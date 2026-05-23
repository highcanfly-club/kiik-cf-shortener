<!--
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
<template>
    <div id="head" class="flex justify-between">
      <div id="title">
        <div class="">
          <p class="text-3xl font-neutra-bold text-ambblue-800 tracking-widest">{{ t('master_company') }} <span
              class="text-kiikviolet">K</span><span class="text-kiikorange">i</span><span
              class="text-kiikrose">i</span><span class="inline-block -scale-x-100 -ml-1 text-kiikvert">K</span></p>
          <p class="text-3xl font-neutra-demiitalic uppercase text-ambblue-100">{{ t('product_name') }}</p>
        </div>
      </div>
      <div id="logo"><img class="w-32 h-32" src="@/assets/img/Logo-KiiK.svg" /></div>
    </div>
    <div id="subtitle" class="mt-4 flex">
      <h3 class="text-lg font-neutra-bold uppercase tracking-widest text-ambgrey-900 mr-2"><i
          class="fas fa-star-extra-sharp text-ambred-500 mr-1"></i>{{ t('simple_link_shortener') }}</h3>
      <h2 class="text-lg font-neutra-demiitalic uppercase tracking-widest text-ambgrey-100">
        {{ t('only_for_us') }}
      </h2>
    </div>
    <hr-dotted />
</template>
<script setup lang="ts">
import HrDotted from "@/components/ui/HRDotted.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n({});
</script>