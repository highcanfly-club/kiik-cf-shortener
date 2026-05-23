/*
MIT License
Copyright (c) 2022-2026 Ronan LE MEILLAT
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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