/*!
=========================================================
* © 2022-2026 Ronan LE MEILLAT for Les Ailes du Mont-Blanc
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
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

