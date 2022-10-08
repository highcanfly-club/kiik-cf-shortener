/*!
=========================================================
* © 2022 Ronan LE MEILLAT for Les Ailes du Mont-Blanc
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/

import Fontminify from '@sctg/fontminify'
import stream from 'stream'
import gulp from 'gulp'
import replace from 'gulp-replace'

const SRC_PATH = 'typo'
const DST_PATH = 'src/assets/typo'
type FontminifyFile = {
    _contents: stream.Readable;
}

function convertTTF2OTF(srcPath: string, dstPath: string): Promise<FontminifyFile[]> {
    return new Promise<FontminifyFile[]>((resolve, reject) => {
        const fontmin = new Fontminify()
            .src(srcPath + '/*.otf')
            .dest(dstPath + '/')
            .use(Fontminify.otf2ttf());

        fontmin.run((err: Error, files: FontminifyFile[], stream) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        })
    })
}

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

        fontmin.run((err: Error, files: FontminifyFile[], stream) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        })
    })
}

function correctCssPath(srcPath: string) {
    gulp.src(srcPath + '/*.css')
        .pipe(replace(/\"src\/assets/g, '"@/assets'))
        .pipe(gulp.dest(srcPath + '/'));
}

//main logic
convertTTF2OTF(SRC_PATH, DST_PATH).then(() => {
    convertTTF2WEB(DST_PATH, DST_PATH).then(() => {
        correctCssPath(DST_PATH)
    })
})
