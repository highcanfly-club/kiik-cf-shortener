import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const _to = (req.query.to || (req.body && req.body.to));
    const to = _to ? _to : 'https://azure.microsoft.com'
    context.res = {
        status:302,
        headers: { "location": to }
    }
};

export default httpTrigger;