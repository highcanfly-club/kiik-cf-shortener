import { AzureFunction, Context, HttpRequest } from "@azure/functions";
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

const httpTrigger: AzureFunction = async function (
  context: Context,
  request: HttpRequest
): Promise<void> {
  let response = { body: null as string };
  const auth0Domain: string = process.env.AUTH0_DOMAIN;
  const authorizationHeader = request.headers["auth0-authorization"]; //authorization is those from Azure
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
      context.log.info("permission OK");
      let slug: string;
      do {
        slug = nanoid();
        context.log.info(slug);
      } while (await isShortLinkExists(slug, auth0Domain)); //ensure that the key is not already registred ()

      const requestBody: {
        url: string;
        ttl: string | null;
        description?: string;
      } = request.body;
      if ("url" in requestBody && "ttl" in requestBody) {
        const itemId = await addShortLink(
          slug,
          request.body.url,
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
      context.log.info("no permission");
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
  context.res = response;
};

export default httpTrigger;
