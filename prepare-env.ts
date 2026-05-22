/*generate auth0-conf.json*/
import fs from "fs"
import https from "https"
import packageJsonLock from "./package-lock.json" with {type:"json"}
import {LineCount} from "@sctg/code-stats"

/**
 * Counts lines of code in the specified directories and saves the result to a JSON file.
 */
const results = await LineCount.countLines(['src','api/add-short-url','api/autoroute','api/common','api/list-short-url','api/redirect'])
fs.writeFile(
  "./src/config/codeStats.json",
  JSON.stringify(results),
  "utf8",
  function (err) {
    if (err) return console.log(err);
  }
);

/**
 * Prepares Auth0 configuration based on environment variables.
 */
const auth0Conf = {
    "domain": process.env.AUTH0_DOMAIN,
    "clientId": process.env.AUTH0_CLIENT_ID,
    "useRefreshTokens": true,
    "cacheLocation": "localstorage",
    "authorizationParams": {
      "scope": 'openid email profile user_metadata app_metadata picture',
      "audience": "https://kiik.api"
    }
  };
  fs.writeFile('./src/config/auth0-conf.json',
    JSON.stringify(auth0Conf),
    'utf8', function (err) {
      if (err) return console.log(err);
    }
  );

  /**
   * Interface representing Auth0 JSON Web Key Set (JWKS).
   */
  export interface Auth0JWKS {
    alg: string;
    kty: string;
    use: string;
    n: string;
    e: string;
    kid: string;
    x5t: string;
    x5c: string[];
    domain: string;
    namespace: string;
  }
  
  /**
   * Fetches JWKS from Auth0 domain.
   * @returns A promise resolving to Auth0JWKS.
   */
  async function getJwks() {
    console.log(
      `retrieve https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    );
    const url = `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`;
    return new Promise<Auth0JWKS>((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = "" as string;
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            const structuredData = JSON.parse(data) as Auth0JWKS;
            structuredData.domain = process.env.AUTH0_DOMAIN || '';
            structuredData.namespace = process.env.AUTH0_CUSTOM_NAMESPACE || '';
            resolve(structuredData);
          });
        })
        .on("error", (err) => {
          console.log(err.message);
          reject(err);
        });
    });
  }
  
  /**
   * Saves JWKS to configuration files for both frontend and backend.
   */
  (async () => {
    const jwks = await getJwks();
    fs.writeFile(
      "./src/config/jwks.json",
      JSON.stringify(jwks),
      "utf8",
      function (err) {
        if (err) return console.log(err);
      }
    );
  })();

  (async () => {
    const jwks = await getJwks();
    fs.writeFile(
      "./api/common/config/jwks.json",
      JSON.stringify(jwks),
      "utf8",
      function (err) {
        if (err) return console.log(err);
      }
    );
  })();

/**
 * Extracts SDK and framework versions from package-lock.json and saves them.
 */
const versions = {
  cosmosDBSdkVersion: packageJsonLock.packages["node_modules/@azure/cosmos"].version,
  auth0SdkVersion: packageJsonLock.packages["node_modules/@auth0/auth0-spa-js"].version,
  viteVersion: packageJsonLock.packages["node_modules/vite"].version,
  vueVersion: packageJsonLock.packages["node_modules/vue"].version,
};
fs.writeFile(
  "./src/config/versions.json",
  JSON.stringify(versions),
  "utf8",
  function (err) {
    if (err) return console.log(err);
  }
);

/**
 * Copies flag SVG files based on available languages.
 */
import {availableLanguages} from './src/config/locales.js'
availableLanguages.forEach((lang)=>{
  const baseFile = lang.substring(3).toLowerCase()
  fs.copyFileSync(`./flags/${baseFile}.svg`,`./src/assets/lang/${baseFile}.svg`)
})