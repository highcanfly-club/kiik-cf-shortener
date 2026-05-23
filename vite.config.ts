/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

