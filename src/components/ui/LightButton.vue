<!--
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
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