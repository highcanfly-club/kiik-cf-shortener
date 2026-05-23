/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { CosmosClient } from "@azure/cosmos";
export type ResourceNameValue = { name: string; value: string };
const options = {
  endpoint: process.env.COSMOSDB_ENDPOINT,
  key: process.env.COSMOSDB_KEY,
  userAgentSuffix: "KiiK",
};

const client = new CosmosClient(options);
const container = client
  .database(process.env.COSMOSDB_DATABASE)
  .container(process.env.COSMOSDB_COLLECTION);

/**
 * Retrieves the long URL associated with a short link.
 * @param shortlink - The short link slug.
 * @param auth0Domain - The Auth0 domain to narrow the search scope.
 * @returns A promise resolving to a ResourceNameValue object.
 */
export const getLongUrl = (shortlink: string, auth0Domain: string) => {
  const querySpec = {
    query:
      "SELECT c.name,c['value'] FROM c WHERE c.name=@shortLink AND c.auth0Domain_hash=@hash",
    parameters: [
      {
        name: "@shortLink",
        value: shortlink,
      },
      {
        name: "@hash",
        value: cyrb53(auth0Domain),
      },
    ],
  };
  return new Promise<ResourceNameValue>((resolve, reject) => {
    container.items
      .query<ResourceNameValue>(querySpec, {})
      .fetchNext()
      .then((results) => {
        if (
          results.resources &&
          results.resources[0] &&
          results.resources[0].name &&
          results.resources[0].value
        ) {
          resolve({
            name: results.resources[0].name,
            value: results.resources[0].value,
          });
        } else {
          reject("ERROR: empty result");
        }
      })
      .catch(() => {
        reject("ERROR: fetchNext().catch()");
      });
  });
};

/**
 * Checks if a short link slug already exists in the database.
 * @param shortlink - The short link slug to check.
 * @param auth0Domain - The Auth0 domain scope.
 * @returns A promise resolving to true if it exists, false otherwise.
 */
export const isShortLinkExists = (shortlink: string, auth0Domain: string) => {
  return new Promise<boolean>((resolve) => {
    getLongUrl(shortlink,auth0Domain)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      })
      .finally(() => {
        resolve(false);
      });
  });
};

/**
 * cyrb53 non-cryptographic hash function.
 * Used to hash the Auth0 domain for lookups.
 * @param str - Input string to hash.
 * @param seed - Optional seed value.
 */
export const cyrb53 = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch: number; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export type Item = {
  name: string;
  value: string;
  description: string;
  expiration: number;
  auth0Domain_hash: number;
  ttl: number;
  id?:string
};

/**
 * Adds a new short link mapping to CosmosDB.
 * @param shortlink - The unique slug.
 * @param url - The destination URL.
 * @param ttl - Time To Live in seconds.
 * @param description - Optional description.
 * @param auth0Domain - The Auth0 domain to associate with.
 * @returns A promise resolving to the ID of the created document.
 */
export const addShortLink = (
  shortlink: string,
  url: string,
  ttl: number,
  description: string,
  auth0Domain: string
) => {
  const newItem: Item = {
    name: shortlink,
    value: url,
    description: description,
    expiration: Date.now() + ttl * 1000,
    auth0Domain_hash: cyrb53(auth0Domain),
    ttl: ttl,
  };
  return new Promise<string>((resolve,reject) => {
    container.items.create(newItem).then((insertedItem)=>{
      if (insertedItem && insertedItem.resource && insertedItem.resource.id)
      {
        resolve(insertedItem.resource.id)
      }
      else{
        reject("ERROR: insertedItem && insertedItem.resource && insertedItem.resource.id is false")
      }
    }).catch(()=>{
      reject("ERROR: create().catch")
    })
  });
};

/**
 * Lists all links associated with a specific Auth0 domain hash.
 * @param auth0Domain - The Auth0 domain.
 * @returns A promise resolving to an array of Items.
 */
export const listAllLinks = (auth0Domain:string) => {
  const querySpec = {
    query:
      "SELECT c.name,c['value'],c.description,c.expiration,c.auth0Domain_hash  FROM c WHERE c.auth0Domain_hash=@hash",
    parameters: [
      {
        name: "@hash",
        value: cyrb53(auth0Domain),
      },
    ],
  };
  return new Promise<Item[]>((resolve, reject) => {
    container.items
      .query<Item>(querySpec, {})
      .fetchNext()
      .then((results) => {
        if (
          results.resources &&
          results.resources[0] &&
          results.resources[0].name &&
          results.resources[0].value
        ) {
          resolve(results.resources);
        } else {
          reject("ERROR: empty result");
        }
      })
      .catch(() => {
        reject("ERROR: fetchNext().catch()");
      });
  });
};