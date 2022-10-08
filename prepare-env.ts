/*generate auth0-conf.json*/
import fs from "fs"
import https from "https"
const auth0Conf = {
    "domain": process.env.AUTH0_DOMAIN,
    "client_id": process.env.AUTH0_CLIENT_ID,
    "scope": 'openid email profile user_metadata app_metadata picture',
    "useRefreshTokens": true,
    "cacheLocation": "localstorage",
    "audience": "https://kiik.api"
  };
  fs.writeFile('./src/config/auth0-conf.json',
    JSON.stringify(auth0Conf),
    'utf8', function (err) {
      if (err) return console.log(err);
    }
  );

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
            structuredData.domain = process.env.AUTH0_DOMAIN;
            structuredData.namespace = process.env.AUTH0_CUSTOM_NAMESPACE;
            resolve(structuredData);
          });
        })
        .on("error", (err) => {
          console.log(err.message);
          reject(err);
        });
    });
  }
  
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

  //Install necessary flags
import {availableLanguages} from './src/config/locales.js'
availableLanguages.forEach((lang)=>{
  const baseFile = lang.substring(3).toLowerCase()
  fs.copyFileSync(`./flags/${baseFile}.svg`,`./src/assets/lang/${baseFile}.svg`)
})