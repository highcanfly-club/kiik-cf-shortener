import fs from 'fs/promises'
import * as fsc from 'fs'
import path from 'path'
import { Transform } from 'stream'
import glob from 'glob'
import Fontminify from '@sctg/fontminify'
import { Plugin, UserConfig, ResolvedConfig } from 'vite';
import colors from 'picocolors'

const FA_FONT_REGEX = /fa-.*\.(eot|ttf|svg|woff|woff2)(\?.+)?$/
const FA_TTF_FILTER = "fa-*.ttf"
const TTF_REGEX = /fa-.*\.(ttf)(\?.+)?$/
const TEXT_REGEX = /\.(js|css|html)$/
const GLYPH_REGEX = /content\s*:[^};]*?('|")(.*?)\s*('|"|;)/g
const UNICODE_REGEX = /\\([0-9a-f]{2,6})/i
const SHA256_8_REGEX = /(fa-.*-[0-9]{3})\.(.*)\.(eot|ttf|svg|woff|woff2)$/
const FONTMIN_EXTENSIONS = ['eot', 'woff', 'woff2', 'svg']
const BASE_DIR = 'dist/assets'
const GLYPH_WHITELIST = ['']
const FONTAWESOME_SRC_DIR = './fontawesome/webfonts'

function makeYellow(str: string) {
  return colors.yellow(str);
}

const enum WriteType {
  TTF,
  EOT,
  WOFF,
  WOFF2,
  SVG
}

function getWriteType(file: string): WriteType {
  switch (path.extname(file).toUpperCase()) {
    case '.TTF':
      return WriteType.TTF;
      break;
    case '.EOT':
      return WriteType.EOT;
      break;
    case '.WOFF':
      return WriteType.WOFF;
      break;
    case '.WOFF2':
      return WriteType.WOFF2;
      break;
    case '.SVG':
      return WriteType.SVG;
      break;
  }
  return WriteType.TTF
}

const writeColors = {
  [WriteType.TTF]: colors.cyan,
  [WriteType.EOT]: colors.magenta,
  [WriteType.WOFF]: colors.green,
  [WriteType.WOFF2]: colors.white,
  [WriteType.SVG]: colors.gray
}

function printFileInfo(
  filebase: string,
  filename: string,
  fileSize: number,
  type: WriteType,
  maxLength: number,
  config: ResolvedConfig
) {
  const chunkLimit = config.build.chunkSizeWarningLimit
  const outDir = filebase + '/'
  const kibs = fileSize / 1024
  const sizeColor = kibs > chunkLimit ? colors.yellow : colors.dim
  config.logger.info(
    `${colors.gray(colors.white(colors.dim(outDir)))}${writeColors[type](
      filename.padEnd(maxLength + 2)
    )} ${sizeColor(`${kibs.toFixed(2)} KiB`)}`
  )
}

function getFileList(baseDir: string, regex: RegExp): Promise<string[]> {
  return new Promise((resolve) => {
    fs.readdir(baseDir).then(files => {
      const fileList = files.map(file => {
        if (file.match(regex))
          return file
        else
          return false
      })
      const filteredFileList = fileList.filter(Boolean) as string[]
      resolve(filteredFileList)
    })
  })
}

function getSurrogatePair(astralCodePoint: number): [number, number] {
  const highSurrogate = Math.floor((astralCodePoint - 0x10000) / 0x400) + 0xD800
  const lowSurrogate = ((astralCodePoint - 0x10000) % 0x400) + 0xDC00
  return [highSurrogate, lowSurrogate]
}


function getUnicodeGlyphs(baseDir: string, file: string, regex: RegExp): Promise<string[]> {
  return new Promise((resolve) => {
    fs.readFile(`${baseDir}/${file}`, { encoding: 'utf8' }).then(data => {
      const matches = (data.toString()).match(regex) || []
      const glyphList = matches.map(match => {
        const unicodeMatch = match.match(UNICODE_REGEX)
        if (!unicodeMatch) {
          return false
        }
        const unicodeHex = unicodeMatch[1]
        const numericValue = parseInt(unicodeHex, 16)
        const character = String.fromCharCode(numericValue)
        if (unicodeHex.length === 2 || unicodeHex.length === 4) {
          return character
        }
        const multiCharacter = getSurrogatePair(numericValue)
          .map(v => String.fromCharCode(v))
          .join('')
        return multiCharacter
      }).filter(Boolean) as string[]
      resolve(glyphList)
    })
  })
}

interface VitePluginFontawesomeminifyOptions {
  /**
   * rebuild cesium library, default: false
   */
  ttfRegex?: RegExp;
  fontRegex?: RegExp;
  infilesRegex?: RegExp;
  outFontExtension?: string[];
  baseDir?: string;
  glyphWhitelist?: string[];
  faTTFFontFilter?: string;
}

export default function vitePluginFontawesomeminify(options: VitePluginFontawesomeminifyOptions = {}): Plugin {
  const {
    ttfRegex = TTF_REGEX,
    infilesRegex = TEXT_REGEX,
    outFontExtension = FONTMIN_EXTENSIONS,
    fontRegex = FA_FONT_REGEX,
    baseDir = BASE_DIR,
    glyphWhitelist = GLYPH_WHITELIST,
    faTTFFontFilter = FA_TTF_FILTER
  } = options;

  let config: ResolvedConfig
  let outDir = baseDir;
  let base: string = '/';
  let isBuild: boolean = false;

  return {
    name: 'vite-plugin-fontawesomeminify',

    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig
    },

    config(c, { command }) {
      isBuild = command === 'build';
      if (c.base) {
        base = c.base;
        if (base === '') base = './';
      }
      if (c.build?.outDir) {
        outDir = c.build.outDir;
      }
      const userConfig: UserConfig = {};
      if (!isBuild) {
      } else {
        // -----------build------------

      }
      return userConfig;
    },

    async closeBundle() {
      if (isBuild) {
        config.logger.info(makeYellow('Minify FontAwesome fonts'))
        getFileList(baseDir, infilesRegex).then(files => {
          let glyphListStr = ''
          const processes = [] as Promise<string[]>[]
          files.forEach(_file => {
            processes.push(getUnicodeGlyphs(baseDir, _file, GLYPH_REGEX))
          })
          Promise.all(processes).then((glyphs) => {
            const glyphsAndWhiteList = glyphs.concat(glyphWhitelist).join(' ')
            const fontmin = new Fontminify()
              .use(Fontminify.glyph({
                text: glyphsAndWhiteList,
                hinting: true
              }))
              .src(`${BASE_DIR}/${faTTFFontFilter}`)
              .dest(`${BASE_DIR}/`)
              //.use(Fontmin.ttf2eot())
              .use(Fontminify.ttf2woff({
                deflate: true
              } as any))
              .use(Fontminify.ttf2woff2())
            //.use(Fontmin.ttf2svg())
            fontmin.use(new Transform({
              objectMode: true,
              // allowHalfOpen: false,
              transform(chunk, enc, callback) {
                let srcFile = ''
                let splitPath = []
                if (chunk && chunk.path) {
                  splitPath = chunk.path.match(SHA256_8_REGEX)
                  if (splitPath && splitPath.length >= 3) {
                    srcFile = `${BASE_DIR}/${splitPath[1]}*.${splitPath[3]}`
                    glob(srcFile, function (err, matches) {
                      if (matches.length) {
                        const origSplitted = matches[0].match(SHA256_8_REGEX)
                        chunk.basename = `${origSplitted ? origSplitted[1]:''}.${origSplitted ? origSplitted[2]: ''}.${origSplitted ? origSplitted[3]:''}`
                        const dstFileStat = fsc.statSync(`${BASE_DIR}/${chunk.basename}`)
                        //printFileInfo(baseDir, chunk.basename, dstFileStat.size, getWriteType(chunk.basename), 70, config)
                      }
                    })
                  }
                }
                callback(null, chunk)
              }
            }))
            fontmin.run((err: Error, files, stream) => {
              getFileList(baseDir, fontRegex).then((files) => {
                config.logger.info(makeYellow('After FontAwesome minification'))
                files.forEach((file) => {
                  const fileStat = fsc.statSync(baseDir + '/' + file)
                  printFileInfo(baseDir, file, fileStat.size, getWriteType(file), 70, config)
                })
              })
              if (err) {
                throw err;
              }
            })
          })

        })
      }
    },

  };
}
