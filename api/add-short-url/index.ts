/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
  isAllowed,
  parseTokenFromAuthorizationHeader,
  AUTH0_PERMISSION,
} from "../common/auth0/TokenHelper.js";
import { customAlphabet } from "nanoid";
import { addShortLink, isShortLinkExists } from "../common/cosmosdb.js";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
  5
);

/**
 * Azure Function to create a new short URL.
 * Generates a unique slug using nanoid and saves the mapping to CosmosDB.
 * Requires AUTH0_PERMISSION.add_short_url.
 */
export async function addShortUrl(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth0Domain: string = process.env.AUTH0_DOMAIN;
  const response: HttpResponseInit = { body: null as string };
  const authorizationHeader = request.headers.get("auth0-authorization"); // authorization is those from Azure
  const jwtToken: string =
    parseTokenFromAuthorizationHeader(authorizationHeader);
  if (jwtToken !== null) {
    /**
     * 2 - Validate JWT token
     * 2a - validate signature against the certificate retrieved from https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json
     *      during vuejs lauch (via vue.config.js)
     * 2b - check if now is beetween iat (claim) and exp (expiry)
     * 2c - check if ADD_SHORT_URL is present in permissions[]
     */
     const now =  Date.now() / 1000
    const hasPermission: boolean = await isAllowed(
      jwtToken,
      auth0Domain,
      now,
      AUTH0_PERMISSION.add_short_url
    );
    if (hasPermission !== false) {
      context.log("permission OK");
      let slug: string;
      // Loop until a unique slug is found
      do {
        slug = nanoid();
        context.log(slug);
      } while (await isShortLinkExists(slug, auth0Domain)); //ensure that the key is not already registred ()

      const requestBody = (await request.json()) as {
        url: string;
        ttl: string | null;
        description?: string;
      };
      if ("url" in requestBody && "ttl" in requestBody) {
        const itemId = await addShortLink(
          slug,
          requestBody.url,
          parseInt(requestBody.ttl),
          requestBody.description,
          auth0Domain
        );
        if (itemId && itemId.length) {
          const shortenedURL = `${new URL(request.url).origin}/${slug}`;
          const responseBody = {
            message: "Link shortened successfully",
            slug,
            url: requestBody.url,
            shortened: shortenedURL,
            expiration: Date.now() + 1000 * Number(requestBody.ttl),
          };
          response.body = JSON.stringify(responseBody);
        } else {
          response.body = JSON.stringify(
            { error: "Error during save" },
            null,
            3
          );
        }
      } else {
        response.body = JSON.stringify({ error: "Error with body" }, null, 3);
      }
    } else {
      context.log("no permission");
      response.body = JSON.stringify({ error: "WRONG PERMISSION", hasPermission: hasPermission,auth0Domain: auth0Domain, now: now, token: jwtToken, permission: AUTH0_PERMISSION.list_all_short_url }, null, 3);
    }
  } else {
    console.log("no token");
    response.body = JSON.stringify(
      { error: "You must provide JWT in 'Authorization: Bearer' header" },
      null,
      3
    );
  }
  return response;
}

/**
 * Register the HTTP trigger for add-short-url.
 */
app.http("add-short-url", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "add-short-url",
  handler: addShortUrl,
});

