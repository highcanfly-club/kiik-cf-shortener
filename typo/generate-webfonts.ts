/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


import Fontminify from '@sctg/fontminify'
import type { Readable } from 'stream'
import gulp from 'gulp'
import replace from 'gulp-replace'

const SRC_PATH = 'typo'
const DST_PATH = 'src/assets/typo'

/**
 * File object structure used by Fontminify.
 */
type FontminifyFile = {
    _contents: Readable;
}

/**
 * Converts OTF fonts to TTF format using Fontminify.
 * @param srcPath - Source directory path containing OTF files.
 * @param dstPath - Destination directory path for TTF files.
 * @returns A promise that resolves with the list of processed files.
 */
function convertTTF2OTF(srcPath: string, dstPath: string): Promise<FontminifyFile[]> {
    return new Promise<FontminifyFile[]>((resolve, reject) => {
        const fontmin = new Fontminify()
            .src(srcPath + '/*.otf')
            .dest(dstPath + '/')
            .use(Fontminify.otf2ttf());

        fontmin.run((err: Error, files: FontminifyFile[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        })
    })
}

/**
 * Converts TTF fonts to various web formats (WOFF, WOFF2) and generates CSS.
 * @param srcPath - Source directory path containing TTF files.
 * @param dstPath - Destination directory path for web fonts and CSS.
 * @returns A promise that resolves with the list of processed files.
 */
function convertTTF2WEB(srcPath: string, dstPath: string): Promise<FontminifyFile[]> {
    return new Promise<FontminifyFile[]>((resolve, reject) => {
        const fontmin = new Fontminify()
            .src(srcPath + '/*.ttf')
            .dest(dstPath + '/')
            .use(Fontminify.ttf2woff())
            .use(Fontminify.ttf2woff2())
            // .use(Fontmin.ttf2eot())
            // .use(Fontmin.ttf2svg())
            .use(Fontminify.css({
                fontPath: srcPath + '/',
            }));

        fontmin.run((err: Error, files: FontminifyFile[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        })
    })
}

/**
 * Uses Gulp to correct font paths in generated CSS files to use Vite aliases.
 * @param srcPath - Directory path where CSS files are located.
 */
function correctCssPath(srcPath: string) {
    gulp.src(srcPath + '/*.css')
    .pipe(replace(/"src\/assets\/typo\//g, '"@/assets/typo/'))
        .pipe(gulp.dest(srcPath + '/'));
}

/**
 * Main execution logic:
 * 1. Convert OTF to TTF
 * 2. Convert TTF to WOFF/WOFF2 and generate CSS
 * 3. Adjust paths in the generated CSS
 */
convertTTF2OTF(SRC_PATH, DST_PATH).then(() => {
    convertTTF2WEB(DST_PATH, DST_PATH).then(() => {
        correctCssPath(DST_PATH)
    })
})

