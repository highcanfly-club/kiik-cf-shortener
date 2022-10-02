<!--
=========================================================
* © 2022 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
-->
<template>
  <div ref="tick" class="text-6xl">
    <div data-repeat="true" aria-hidden="true">
      <span data-view="flip"></span>
    </div>
  </div>
</template>

<script lang="ts">
import Tick from "@pqina/flip";
import "@pqina/flip/dist/flip.min.css";
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "Flip",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  watch: {
    value(newValue) {
      this._tick.value = newValue;
    },
  },
  mounted() {
    this._tick = Tick.DOM.create(this.$refs.tick, {
      value: this.$props.value,
    });
  },
  unmounted() {
    Tick.DOM.destroy(this.$refs.tick);
  },
});
</script>
