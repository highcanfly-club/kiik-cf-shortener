<!--
=========================================================
* © 2022-2026 Ronan LE MEILLAT for Les Ailes du Mont-Blanc
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
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
        if (messages.value[wantedLocale].length == 0) {
            import(`@/locales/${wantedLocale}.json`).then((loadedMessages) => {
                messages.value[wantedLocale] = loadedMessages;
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