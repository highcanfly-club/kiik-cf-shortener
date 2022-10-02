<!--
=========================================================
* © 2022 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
-->
<template>
  <div class="rounded-3xl bg-white text-slate-600 shadow-xl mt-10 p-10">
    <flip-clock :value="counter !== undefined ? counter : '00000'" />
  </div>
</template>

<script lang="ts">
import FlipClock from "@/components/FlipClock.vue";
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "FlipCard",
  data() {
    const counter = ref('000000')
    return {
      counter,
    };
  },
  mounted() {
    setInterval(this.updateCounter, 2000);
  },
  methods: {
    zeroPad: function (num:number, places:number) {
      return String(num).padStart(places, "0");
    },
    updateCounter: function () {
      this.counter = this.zeroPad(Math.floor(Math.random() * 100000), 5);
    },
  },
  components: {
    FlipClock,
  },
})

</script>

