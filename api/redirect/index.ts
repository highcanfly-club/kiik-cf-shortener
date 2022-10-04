import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getLongUrl } from "../common/cosmosdb";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const auth0Domain: string = process.env.AUTH0_DOMAIN;
    const _to = (req.query.to || (req.body && req.body.to as string));
    const to = _to ? _to : context.bindingData.link
    try{
        const longUrl = (await getLongUrl(to,auth0Domain)).value
        console.log(`redirect to: ${longUrl}`)
        context.res = {
            status:302,
            headers: { "location": longUrl }
        }
    }
    catch(error){
        context.res = {
            status:500,
            body: error
        }
    }

};

export default httpTrigger;