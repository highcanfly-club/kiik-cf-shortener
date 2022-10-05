import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { listAllLinks, Item } from "../common/cosmosdb";
import {
  isAllowed,
  parseTokenFromAuthorizationHeader,
  AUTH0_PERMISSION,
} from "../common/auth0/TokenHelper";

const httpTrigger: AzureFunction = async function (
  context: Context,
  request: HttpRequest
): Promise<void> {
  const auth0Domain: string = process.env.AUTH0_DOMAIN;
  let response = { body: null as string };
  context.log.info(request)
  const authorizationHeader = request.headers["authorization"];
  const jwtToken: string =
    parseTokenFromAuthorizationHeader(authorizationHeader);
  if (jwtToken !== null) {
    const hasPermission: boolean = await isAllowed(
      jwtToken,
      auth0Domain,
      Date.now() / 1000,
      AUTH0_PERMISSION.list_all_short_url
    );
    if (hasPermission !== false) {
      const items = await listAllLinks(auth0Domain);
      response.body = JSON.stringify(items);
    }
    else{
        response.body = JSON.stringify({ error: "WRONG PERMISSION" })
    }
  }else{
    response.body = JSON.stringify({ error: "NO TOKEN" })
  }

  context.res = response;
};

export default httpTrigger;
