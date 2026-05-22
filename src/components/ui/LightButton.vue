<template>
    <button
        class="inline-flex items-center py-2 px-3 text-sm font-neutra-booksc text-center text-ambblue-800 hover:text-white rounded-lg hover:bg-ambblue-100 border-ambblue-800 hover:border-2 hover:border-transparent border-2 border-dotted group">
        <i
            class="fas fa-star-extra-sharp text-ambred-500 group-hover:text-ambyel-500 pb-1 mr-1"></i><span v-html="props.text"></span>
    </button>
</template>
<script setup lang="ts">
/**
 * Simple styled button component with an icon.
 * Props:
 * - text: The text (HTML supported) to display in the button.
 */
    const props = withDefaults(defineProps<{ 
        text: string; 
         }>(), { 
            text: '&nbsp;more&nbsp;&nbsp;→', 
             })
</script>