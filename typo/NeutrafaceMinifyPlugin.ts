import fs from "fs/promises";
import * as fsc from "fs";
import path from "path";
import { Transform } from "stream";
import {glob} from "glob";
import Fontminify from "@sctg/fontminify";
import { Plugin, UserConfig, ResolvedConfig } from "vite";
import colors from "picocolors";

const NEUTRA_FONT_REGEX = /NeutrafaceText-.*\.(eot|ttf|svg|woff|woff2)(\?.+)?$/;
const NEUTRA_TTF_FILTER = "NeutrafaceText-*.ttf";
const TTF_REGEX = /NeutrafaceText-.*\.(ttf)(\?.+)?$/;
const LOCALES_DIR = "src/locales";
const LOCALES_REGEX = /.*json$/;
const SHA256_8_REGEX = /(NeutrafaceText.*)\.(.*)\.(eot|ttf|svg|woff|woff2)$/;
const FONTMIN_EXTENSIONS = ["eot", "woff", "woff2", "svg"];
const BASE_DIR = "dist/assets";
const GLYPH_WHITELIST = [""];
const NEUTRA_SRC_DIR = "./typo";

function makeYellow(str: string) {
  return colors.yellow(str);
}

const enum WriteType {
  TTF,
  EOT,
  WOFF,
  WOFF2,
  SVG,
}

function getWriteType(file: string): WriteType {
  switch (path.extname(file).toUpperCase()) {
    case ".TTF":
      return WriteType.TTF;
      break;
    case ".EOT":
      return WriteType.EOT;
      break;
    case ".WOFF":
      return WriteType.WOFF;
      break;
    case ".WOFF2":
      return WriteType.WOFF2;
      break;
    case ".SVG":
      return WriteType.SVG;
      break;
  }
  return WriteType.TTF;
}

const writeColors = {
  [WriteType.TTF]: colors.cyan,
  [WriteType.EOT]: colors.magenta,
  [WriteType.WOFF]: colors.green,
  [WriteType.WOFF2]: colors.white,
  [WriteType.SVG]: colors.gray,
};

function printFileInfo(
  filebase: string,
  filename: string,
  fileSize: number,
  type: WriteType,
  maxLength: number,
  config: ResolvedConfig
) {
  const chunkLimit = config.build.chunkSizeWarningLimit;
  const outDir = filebase + "/";
  const kibs = fileSize / 1024;
  const sizeColor = kibs > chunkLimit ? colors.yellow : colors.dim;
  config.logger.info(
    `${colors.gray(colors.white(colors.dim(outDir)))}${writeColors[type](
      filename.padEnd(maxLength + 2)
    )} ${sizeColor(`${kibs.toFixed(2)} KiB`)}`
  );
}

function getFileList(baseDir: string, regex: RegExp): Promise<string[]> {
  return new Promise((resolve) => {
    fs.readdir(baseDir).then((files) => {
      const fileList = files.map((file) => {
        if (file.match(regex)) return file;
        else return false;
      });
      const filteredFileList = fileList.filter(Boolean) as string[];
      resolve(filteredFileList);
    });
  });
}

interface vitePluginNeutrafaceMinifyOptions {
  /**
   * rebuild cesium library, default: false
   */
  ttfRegex?: RegExp;
  fontRegex?: RegExp;
  baseDir?: string;
  localesDir?: string;
  infilesRegex?: RegExp;
  outFontExtension?: string[];
  glyphWhitelist?: string[];
  neutraTTFFontFilter?: string;
}

export default function vitePluginNeutrafaceMinify(
  options: vitePluginNeutrafaceMinifyOptions = {}
): Plugin {
  const {
    ttfRegex = TTF_REGEX,
    localesDir = LOCALES_DIR,
    infilesRegex = LOCALES_REGEX,
    outFontExtension = FONTMIN_EXTENSIONS,
    fontRegex = NEUTRA_FONT_REGEX,
    baseDir = BASE_DIR,
    glyphWhitelist = GLYPH_WHITELIST,
    neutraTTFFontFilter = NEUTRA_TTF_FILTER,
  } = options;

  let config: ResolvedConfig;
  let outDir = baseDir;
  let base: string = "/";
  let isBuild: boolean = false;

  return {
    name: "vite-plugin-neutrafeceminify",

    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig;
    },

    config(c, { command }) {
      isBuild = command === "build";
      if (c.base) {
        base = c.base;
        if (base === "") base = "./";
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
        config.logger.info(makeYellow("Minify Neutraface fonts"));
        getFileList(localesDir, infilesRegex).then((files) => {
          let glyphListStr = "";
          const processes = [] as Promise<string[]>[];
          files.forEach((_file) => {
            processes.push(getGlyphs(localesDir, _file));
          });
          Promise.all(processes).then((glyphs) => {
            const glyphsAndWhiteList = [
              ...new Set(glyphs.concat(glyphWhitelist).join("")),
            ].join(",");
            const fontmin = new Fontminify()
              .use(
                Fontminify.glyph({
                  text: glyphsAndWhiteList,
                  hinting: true,
                })
              )
              .src(`${BASE_DIR}/${neutraTTFFontFilter}`)
              .dest(`${BASE_DIR}/`)
              //.use(Fontmin.ttf2eot())
              .use(
                Fontminify.ttf2woff({
                  deflate: true,
                } as any)
              )
              .use(Fontminify.ttf2woff2());
            //.use(Fontmin.ttf2svg())
            fontmin.use(
              new Transform({
                objectMode: true,
                // allowHalfOpen: false,
                transform(chunk, enc, callback) {
                  let srcFile = "";
                  let splitPath = [];
                  if (chunk && chunk.path) {
                    splitPath = chunk.path.match(SHA256_8_REGEX);
                    if (splitPath && splitPath.length >= 3) {
                      srcFile = `${BASE_DIR}/${splitPath[1]}*.${splitPath[3]}`;
                      glob(srcFile, function (err, matches) {
                        if (matches.length) {
                          const origSplitted = matches[0].match(SHA256_8_REGEX);
                          chunk.basename = `${origSplitted[1]}.${origSplitted[2]}.${origSplitted[3]}`;
                          const dstFileStat = fsc.statSync(
                            `${BASE_DIR}/${chunk.basename}`
                          );
                          //printFileInfo(baseDir, chunk.basename, dstFileStat.size, getWriteType(chunk.basename), 70, config)
                        }
                      });
                    }
                  }
                  callback(null, chunk);
                },
              })
            );
            fontmin.run((err: Error, files, stream) => {
              getFileList(baseDir, fontRegex).then((files) => {
                config.logger.info(makeYellow("After Neutraface minification"));
                files.forEach((file) => {
                  const fileStat = fsc.statSync(baseDir + "/" + file);
                  printFileInfo(
                    baseDir,
                    file,
                    fileStat.size,
                    getWriteType(file),
                    70,
                    config
                  );
                });
              });
              if (err) {
                throw err;
              }
            });
          });
        });
      }
    },
  };
}

function getGlyphs(baseDir: string, file: string): Promise<string[]> {
  return new Promise((resolve) => {
    fs.readFile(`${baseDir}/${file}`, { encoding: "utf8" }).then((data) => {
      const upperData = data.toUpperCase()
      const lowerData = data.toLowerCase()
      const origArray = (upperData+lowerData).split("");
      resolve([...new Set(origArray)]);
    });
  });
}
