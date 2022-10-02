import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getLongUrl } from "../common/cosmosdb";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const _to = (req.query.to || (req.body && req.body.to as string));
    const to = _to ? _to : 'Zp2MT'
    try{
        const longUrl = (await getLongUrl(to)).value
        console.log(`redirect to: ${longUrl}`)
        context.res = {
            status:302,
            headers: { "location": longUrl }
        }
    }
    catch(error){
        context.res = {
            status:500,
            body: JSON.stringify(error)
        }
    }

};

export default httpTrigger;