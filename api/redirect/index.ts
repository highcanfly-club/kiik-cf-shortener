import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getLongUrl } from "../common/cosmosdb.js";

/**
 * Azure Function to handle redirection from a short URL to its original destination.
 * Retrieves the long URL from CosmosDB based on the provided slug.
 */
export async function redirect(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    const auth0Domain: string = process.env.AUTH0_DOMAIN;
    const routeLink = request.params.link;
    const queryTo = request.query.get("to");
    const body = (await request.json().catch(() => null)) as { to?: string } | null;
    const originalUrlHeader = request.headers.get("x-ms-original-url");

    // Resolve 'to' parameter from various sources (query, body, route, or header)
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

/**
 * Register the HTTP trigger for generic redirection.
 */
app.http("redirect", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "redirect",
    handler: redirect,
});

/**
 * Register the HTTP trigger for automatic routing of !slug patterns.
 */
app.http("autoroute", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "{link:regex(^![abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-]{{5}}$)}",
    handler: redirect,
});