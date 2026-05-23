/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vitePluginFontawesomeminify from '@highcanfly-club/fontawesome'
import vitePluginNeutrafaceMinify from "./typo/NeutrafaceMinifyPlugin.js"
import fs from 'fs'

/**
 * Custom Vite plugin to copy FontAwesome webfonts to the distribution directory.
 * This is executed after the build bundle is closed.
 */
function copyFontawesomeWebfonts() {
  return {
    name: 'copy-fontawesome-webfonts',
    closeBundle() {
      const src = path.resolve(__dirname, 'node_modules/@highcanfly-club/fontawesome/webfonts')
      const dst = path.resolve(__dirname, 'dist/webfonts')
      if (fs.existsSync(src)) {
        fs.mkdirSync(dst, { recursive: true })
        fs.cpSync(src, dst, { recursive: true })
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginFontawesomeminify(),
    vitePluginNeutrafaceMinify(),
    copyFontawesomeWebfonts(),
  ],
  resolve: {
    // Paths aliases for cleaner imports
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './node_modules'),
      '§': path.resolve(__dirname, './'),
    },
  },
  server: {
    // HTTPS configuration if local certificates are present
    https: fs.existsSync("./localhost.key") ?
    {
      key: fs.readFileSync("./localhost.key"),
      cert: fs.readFileSync("./localhost.pem"),
    } : undefined,
  }
})

