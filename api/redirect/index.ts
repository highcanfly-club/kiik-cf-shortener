import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getLongUrl } from "../common/cosmosdb.js";

export async function redirect(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    const auth0Domain: string = process.env.AUTH0_DOMAIN;
    const routeLink = request.params.link;
    const queryTo = request.query.get("to");
    const body = (await request.json().catch(() => null)) as { to?: string } | null;
    const originalUrlHeader = request.headers.get("x-ms-original-url");

    let to = queryTo ?? body?.to ?? routeLink;
    if (!to && originalUrlHeader) {
        const originalUrl = new URL(originalUrlHeader);
        to = originalUrl.pathname.substring(2); // remove /! from input
    }

    try {
        context.log(`to:${to}`);
        const longUrl = (await getLongUrl(to, auth0Domain)).value;
        context.log(`redirect to: ${longUrl}`);
        return {
            status: 302,
            headers: { location: longUrl },
        };
    } catch (error) {
        return {
            status: 500,
            body: `${error}`,
        };
    }
}

app.http("redirect", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "redirect",
    handler: redirect,
});

app.http("autoroute", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "{link:regex(^![abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-]{{5}}$)}",
    handler: redirect,
});