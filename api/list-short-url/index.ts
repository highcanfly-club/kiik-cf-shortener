import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { listAllLinks,Item } from "../common/cosmosdb";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const auth0Domain: string = process.env.AUTH0_DOMAIN;
    const items = await listAllLinks(auth0Domain)
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(items)
    };

};

export default httpTrigger;