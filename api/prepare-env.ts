/*generate auth0-conf.json*/
import fs from "fs";
import https from "https";
import packageJsonLock from './package-lock.json' assert {type:'json'}

/**
 * Generates Auth0 configuration file based on environment variables and package versions.
 */
const auth0Conf = {
  "auth0SdkVersion": packageJsonLock.packages["node_modules/@auth0/auth0-spa-js"].version,
  "domain": process.env.AUTH0_DOMAIN,
  "clientId": process.env.AUTH0_CLIENT_ID,
  "useRefreshTokens": true,
  "cacheLocation": "localstorage",
  "authorizationParams": {
    "scope": "openid email profile user_metadata app_metadata picture",
    "audience": "https://kiik.api"
  }
};
fs.writeFile(
  "./common/config/auth0-conf.json",
  JSON.stringify(auth0Conf),
  "utf8",
  function (err) {
    if (err) return console.log(err);
  }
);

/**
 * Structure of a JSON Web Key in a JWKS.
 */
export interface KeyJWKS {
  alg: string;
  kty: string;
  use: string;
  n: string;
  e: string;
  kid: string;
  x5t: string;
  x5c: string[];
}

/**
 * Structure of the JWKS response.
 */
export interface JWKS {
  keys:KeyJWKS[];
}

/**
 * Extended JWKS structure including domain and custom namespace.
 */
export interface Auth0JWKS extends JWKS {
  domain: string;
  namespace: string;
}

/**
 * Fetches the Auth0 JWKS from the configured domain.
 * @returns A promise resolving to an Auth0JWKS object.
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
          const structuredData = {
            ...(JSON.parse(data) as JWKS),
            domain: process.env.AUTH0_DOMAIN,
            namespace: process.env.AUTH0_CUSTOM_NAMESPACE,
          };
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
 * Main execution: fetch JWKS and save it to the common config directory.
 */
(async () => {
  const jwks = await getJwks();
  fs.writeFile(
    "./common/config/jwks.json",
    JSON.stringify(jwks),
    "utf8",
    function (err) {
      if (err) return console.log(err);
    }
  );
})();

