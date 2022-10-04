import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {
    isAllowed,
    parseTokenFromAuthorizationHeader,
    AUTH0_PERMISSION
  } from "../auth0/TokenHelper"
  import { customAlphabet } from "nanoid";

const httpTrigger: AzureFunction = async function (context: Context, request: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (request.query.name || (request.body && request.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

        const authorizationHeader = request.headers["Authorization"];
        const jwtToken: string =
          parseTokenFromAuthorizationHeader(authorizationHeader);
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

export default httpTrigger;