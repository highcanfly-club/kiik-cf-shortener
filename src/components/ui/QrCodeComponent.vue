<template>
  <img :src="qrcodeData" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import QRCode from "qrcode";
import { onMounted } from "vue";

const qrcodeData = ref<string>("");

const props = withDefaults(defineProps<{ 
        text: string; 
         }>(), { 
            text: 'https://kiik.cf/', 
             })

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
