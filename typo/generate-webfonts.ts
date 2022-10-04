/*!
=========================================================
* © 2022 Ronan LE MEILLAT for Les Ailes du Mont-Blanc
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/

import Fontmin from 'fontmin'
import stream from 'stream'
import gulp from 'gulp'
import replace from 'gulp-replace'

const SRC_PATH = 'typo'
const DST_PATH = 'src/assets/typo'
type FontminFile = {
    _contents: stream.Readable;
}

function convertTTF2OTF(srcPath: string, dstPath: string): Promise<FontminFile[]> {
    return new Promise<FontminFile[]>((resolve, reject) => {
        const fontmin = new Fontmin()
            .src(srcPath + '/*.otf')
            .dest(dstPath + '/')
            .use(Fontmin.otf2ttf());

        fontmin.run((err: Error, files: FontminFile[], stream) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        })
    })
}

function convertTTF2WEB(srcPath: string, dstPath: string): Promise<FontminFile[]> {
    return new Promise<FontminFile[]>((resolve, reject) => {
        const fontmin = new Fontmin()
            .src(srcPath + '/*.ttf')
            .dest(dstPath + '/')
            .use(Fontmin.ttf2woff())
            .use(Fontmin.ttf2woff2())
            .use(Fontmin.ttf2eot())
            .use(Fontmin.ttf2svg())
            .use(Fontmin.css({
                fontPath: srcPath + '/',
            }));

        fontmin.run((err: Error, files: FontminFile[], stream) => {
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
