<!--
=========================================================
* © 2022 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
-->
<template>
    <div
      class="min-w-screen min-h-screen bg-blue-100 flex items-center overflow-hidden relative flex-col"
    >
      <div class="rounded-3xl bg-white shadow-xl mt-10 p-10 flex-col">
        <h1 class="text-6xl text-watermelon-600 text-center">Vue3 template</h1>
        <h3 class="text-xl text-watermelon-300 text-center">with</h3>
        <h1 class="text-6xl text-blue-700 text-center">
          Vite+Vue <i class="fab fa-vuejs"></i>
        </h1>
        <h1 class="text-6xl text-blue-700 text-center">
          Tailwindcss 3 <i class="fab fa-css3"></i>
        </h1>
        <h3 class="text-xl text-watermelon-300 text-center">and</h3>
        <h1 class="text-6xl text-blue-700 text-center">
          Font Awesome 6 <i class="fas fa-font-awesome"></i>
        </h1>
        <h3 class="text-sm text-red-300 text-center">
          don't forget to remove scripts and styles from index.html before
          deployement
        </h3>
      </div>
      <basic-card :msg="`Hello Vue ${version} in Vite!`" />
      <flip-card />
    </div>
  </template>
  
  <script lang="ts">
  import BasicCard from "@/components/BasicCard.vue";
  import FlipCard from "@/components/FlipCard.vue";
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    // type inference enabled
    props: {
    },
    data() {
      const version = this.$.appContext.app.version
      return {
        version
      }
    },
    components:{
      BasicCard,
      FlipCard
    }
  })
  </script>