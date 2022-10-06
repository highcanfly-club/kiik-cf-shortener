import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { listAllLinks, Item } from "../common/cosmosdb.js";
import {
  isAllowed,
  parseTokenFromAuthorizationHeader,
  AUTH0_PERMISSION,
} from "../common/auth0/TokenHelper.js";
import { h } from "vue";

const httpTrigger: AzureFunction = async function (
  context: Context,
  request: HttpRequest
): Promise<void> {
  const auth0Domain: string = process.env.AUTH0_DOMAIN;
  let response = { body: null as string };
  const authorizationHeader = request.headers["auth0-authorization"]; //authorization is those from Azure
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
    context.log.info(`has ${AUTH0_PERMISSION.list_all_short_url}:${hasPermission}`)
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

  context.res = response;
};

export default httpTrigger;
