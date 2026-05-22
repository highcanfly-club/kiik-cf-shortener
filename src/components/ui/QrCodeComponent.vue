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

