/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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
const LOCALES_DIR = "src/locales";
const LOCALES_REGEX = /.*json$/;
const SHA256_8_REGEX = /(NeutrafaceText.*)\.(.*)\.(eot|ttf|svg|woff|woff2)$/;
const BASE_DIR = "dist/assets";
const GLYPH_WHITELIST = [""];

/**
 * Helper to colorize string yellow for terminal output.
 */
function makeYellow(str: string) {
  return colors.yellow(str);
}

/**
 * Enum for supported font file types.
 */
const enum WriteType {
  TTF,
  EOT,
  WOFF,
  WOFF2,
  SVG,
}

/**
 * Determines the WriteType based on file extension.
 * @param file - Filename or path.
 */
function getWriteType(file: string): WriteType {
  switch (path.extname(file).toUpperCase()) {
    case ".TTF":
      return WriteType.TTF;
    case ".EOT":
      return WriteType.EOT;
    case ".WOFF":
      return WriteType.WOFF;
    case ".WOFF2":
      return WriteType.WOFF2;
    case ".SVG":
      return WriteType.SVG;
  }
  return WriteType.TTF;
}

/**
 * Color mapping for different font types in console logs.
 */
const writeColors = {
  [WriteType.TTF]: colors.cyan,
  [WriteType.EOT]: colors.magenta,
  [WriteType.WOFF]: colors.green,
  [WriteType.WOFF2]: colors.white,
  [WriteType.SVG]: colors.gray,
};

/**
 * Prints detailed file information to the Vite logger.
 */
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

/**
 * Lists files in a directory that match a specific regex.
 */
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

/**
 * Options for the Neutraface Minify plugin.
 */
interface vitePluginNeutrafaceMinifyOptions {
  ttfRegex?: RegExp;
  fontRegex?: RegExp;
  baseDir?: string;
  localesDir?: string;
  infilesRegex?: RegExp;
  outFontExtension?: string[];
  glyphWhitelist?: string[];
  neutraTTFFontFilter?: string;
}

/**
 * Vite Plugin to minify Neutraface fonts by keeping only used glyphs found in locales.
 */
export default function vitePluginNeutrafaceMinify(
  options: vitePluginNeutrafaceMinifyOptions = {}
): Plugin {
  const {
    localesDir = LOCALES_DIR,
    infilesRegex = LOCALES_REGEX,
    fontRegex = NEUTRA_FONT_REGEX,
    baseDir = BASE_DIR,
    glyphWhitelist = GLYPH_WHITELIST,
    neutraTTFFontFilter = NEUTRA_TTF_FILTER,
  } = options;

  let config: ResolvedConfig;
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
      return {} as UserConfig;
    },

    async closeBundle() {
      if (isBuild) {
        config.logger.info(makeYellow("Minify Neutraface fonts"));
        getFileList(localesDir, infilesRegex).then((files) => {
          const processes = [] as Promise<string[]>[];
          files.forEach((_file) => {
            processes.push(getGlyphs(localesDir, _file));
          });
          Promise.all(processes).then((glyphs) => {
            // Merge all glyphs from locales and whitelist
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
              .use(Fontminify.ttf2woff())
              .use(Fontminify.ttf2woff2());

            // Transform stream to handle hashed filenames during build
            fontmin.use(
              new Transform({
                objectMode: true,
                transform(chunk, enc, callback) {
                  if (chunk && chunk.path) {
                    const splitPath = chunk.path.match(SHA256_8_REGEX);
                    if (splitPath && splitPath.length >= 3) {
                      const srcFile = `${BASE_DIR}/${splitPath[1]}*.${splitPath[3]}`;
                      glob(srcFile)
                        .then((matches) => {
                          if (matches.length) {
                            const origSplitted = matches[0].match(SHA256_8_REGEX);
                            if (origSplitted && origSplitted.length >= 4) {
                              chunk.basename = `${origSplitted[1]}.${origSplitted[2]}.${origSplitted[3]}`;
                              fsc.statSync(`${BASE_DIR}/${chunk.basename}`);
                            }
                          }
                          callback(null, chunk);
                        })
                        .catch((err) => callback(err));
                      return;
                    }
                  }
                  callback(null, chunk);
                },
              })
            );

            fontmin.run((err: Error) => {
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

/**
 * Extracts unique glyphs (characters) from a file.
 * @param baseDir - Base directory.
 * @param file - Filename.
 * @returns A promise resolving to an array of unique characters.
 */
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

