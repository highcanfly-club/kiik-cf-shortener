<!--
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
<template>
  <img :src="qrcodeData" />
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import QRCode from "qrcode";

const qrcodeData = ref<string>("");

/**
 * Component to generate and display a QR code for a given text/URL.
 */
const props = withDefaults(defineProps<{ 
        text: string; 
         }>(), { 
            text: 'https://a.kiik.pp.ua/', 
             })

/**
 * Generates a QR code Data URL from the input string.
 * @param link - The content to encode in the QR code.
 */
function getQrCode(link: string) {
  QRCode.toDataURL(link)
    .then((data: string) => {
        qrcodeData.value = data;
    })
    .catch((err: Error) => {
        console.error(err);
    });
}

onMounted(()=>{
    getQrCode(props.text)
})
</script>

