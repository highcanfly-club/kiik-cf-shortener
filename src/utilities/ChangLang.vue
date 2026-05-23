<!--
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->

<template>
    <div class="relative inline-block text-left z-50">
        <div>
            <button @click="langOpen = !langOpen" type="button" class=" " id="menu-button" aria-expanded="true"
                aria-haspopup="true">
                <span class="hidden sm:inline-flex">{{ t("nav_lang") }}&nbsp;</span>
                <img class="inline-flex cursor-pointer w-4 h-4 self-center"
                    :src="getFlagSrc(locale)" />
            </button>
        </div>
        <div v-if="langOpen" class="
                        origin-top-right
                        absolute
                        right-0
                        -mt-1
                        w-6
                        focus:outline-none
                        block
                      " role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
            <div class="py-1" role="none">
                <span v-for="locale in availableLocales" :key="`locale-${locale}`" :value="locale">
                    <img @click="changeLang(locale)" class="cursor-pointer w-6 h-6"
                        :src="getFlagSrc(locale)" />
                </span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
/// <reference types="vite/client" />
import { onBeforeMount, ref } from 'vue'
import { useLocaleStore } from '@/utilities/LocaleHelper.js'
import { useRoute,useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const langOpen = ref(false)
const localeCounter = useLocaleStore()
const {locale,availableLocales,messages,fallbackLocale, t} = useI18n({})
const route = useRoute()
const router = useRouter()

/**
 * Dynamically imports all flag SVG icons from the assets folder.
 */
const flagIcons = import.meta.glob('../assets/lang/*.svg', {
    eager: true,
    import: 'default'
}) as Record<string, string>

/**
 * Returns the source URL for a specific locale's flag icon.
 * @param localeCode - The locale string (e.g., 'fr-FR').
 */
const getFlagSrc = (localeCode: string): string => {
    const countryCode = localeCode.substring(3).toLowerCase()
    return flagIcons[`../assets/lang/${countryCode}.svg`] ?? ''
}

/**
 * Handles language changes, including lazy loading of translation files.
 * @param wantedLocale - The locale string to switch to.
 */
const changeLang = (wantedLocale: string) => {
    console.log(`Locale change #${localeCounter.count}`)
    
    if ((locale.value != wantedLocale) && availableLocales.includes(wantedLocale)) {
        localeCounter.count++
        document.querySelector('html')?.setAttribute('lang', wantedLocale)
        // Update URL query parameter
        router.replace({ query: { lang: wantedLocale } })
        console.log(`Change locale from ${locale.value} to ${wantedLocale}`);

        // Lazy load messages if they aren't already loaded
        if ((messages.value as Record<string, string>)[wantedLocale]?.length == 0) {
            import(`@/locales/${wantedLocale}.json`).then((loadedMessages) => {
                (messages.value as Record<string, string>)[wantedLocale] = loadedMessages;
                console.log(`Lazily loaded ${wantedLocale} messages`);
                locale.value = wantedLocale;
                langOpen.value = false;
            });
        } else {
            locale.value = wantedLocale;
            langOpen.value = false;
        }

        // Simple fallback logic
        if (wantedLocale === 'fr-FR') {
            fallbackLocale.value = 'en-US'
        }
        else {
            fallbackLocale.value = 'fr-FR'
        }
    }
}

/**
 * Detects initial language from URL query or browser navigator on mount.
 */
onBeforeMount(() => {
    if ((route.query.lang !== undefined) && route.query.lang !== locale.value) {
        changeLang(route.query.lang as string)
    } else if (localeCounter.count === 0) {
        const mainLang = window.navigator.language
        console.log(`Main lang:${mainLang}`)
        if (availableLocales.includes(mainLang)) {
            changeLang(mainLang)
        }
    }
})
</script>