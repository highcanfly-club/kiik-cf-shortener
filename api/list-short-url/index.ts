import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listAllLinks } from "../common/cosmosdb.js";
import {
  isAllowed,
  parseTokenFromAuthorizationHeader,
  AUTH0_PERMISSION,
} from "../common/auth0/TokenHelper.js";

export async function listShortUrl(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth0Domain: string = process.env.AUTH0_DOMAIN;
  let response: HttpResponseInit = { body: null as string };
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

app.http("list-short-url", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "list-short-url",
  handler: listShortUrl,
});
