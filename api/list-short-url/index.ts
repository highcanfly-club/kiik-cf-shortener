/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listAllLinks } from "../common/cosmosdb.js";
import {
  isAllowed,
  parseTokenFromAuthorizationHeader,
  AUTH0_PERMISSION,
} from "../common/auth0/TokenHelper.js";

/**
 * Azure Function to list all short URLs for the authenticated user/domain.
 * Requires AUTH0_PERMISSION.list_all_short_url.
 */
export async function listShortUrl(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth0Domain: string = process.env.AUTH0_DOMAIN;
  const response: HttpResponseInit = { body: null as string };
  const authorizationHeader = request.headers.get("auth0-authorization"); // authorization is those from Azure
  const jwtToken: string =
    parseTokenFromAuthorizationHeader(authorizationHeader);
  if (jwtToken !== null) {
    const now =  Date.now() / 1000
    const hasPermission: boolean = await isAllowed(
      jwtToken,
      auth0Domain,
      now,
      AUTH0_PERMISSION.list_all_short_url
    );
    context.log(`has ${AUTH0_PERMISSION.list_all_short_url}:${hasPermission}`)
    if (hasPermission !== false) {
      const items = await listAllLinks(auth0Domain);
      response.body = JSON.stringify(items);
    }
    else{
        response.body = JSON.stringify({ error: "WRONG PERMISSION", hasPermission: hasPermission,auth0Domain: auth0Domain, now: now, token: jwtToken, permission: AUTH0_PERMISSION.list_all_short_url })
    }
  }else{
    response.body = JSON.stringify({ error: "NO TOKEN" })
  }

  return response;
}

/**
 * Register the HTTP trigger for list-short-url.
 */
app.http("list-short-url", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "list-short-url",
  handler: listShortUrl,
});

