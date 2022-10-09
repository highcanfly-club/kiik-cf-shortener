/*!
=========================================================
* © 2022 Ronan LE MEILLAT for %CLIENT_NAME%
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vitePluginFontawesomeminify from './fontawesome'
import vitePluginNeutrafaceMinify from "./typo/NeutrafaceMinifyPlugin.js"
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginFontawesomeminify(),
    vitePluginNeutrafaceMinify(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './node_modules'),
      '§': path.resolve(__dirname, './'),
    },
  },
  server: {
    https: fs.existsSync("./localhost.key") ?
    {
      key: fs.readFileSync("./localhost.key"),
      cert: fs.readFileSync("./localhost.pem"),
    } : false,
  }
})
