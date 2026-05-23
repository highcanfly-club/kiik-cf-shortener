# KiiK CF shortener on Azure Static Web Apps

KiiK CF Shortener is a small URL shortener built with Vue 8, Vite, Tailwind CSS 4, Auth0, Azure Static Web Apps managed Functions, and Azure Cosmos DB for NoSQL.

The frontend lets authenticated users create and list short links. The backend can also be called directly with a valid Auth0 access token. Public redirects are handled by the Azure Functions API and the Static Web Apps rewrite rule:

- `POST /api/add-short-url` creates a short link.
- `POST /api/list-short-url` lists links for the configured Auth0 tenant.
- `GET /api/redirect?to=<slug>` redirects to the original URL.
- `GET /!<slug>` is rewritten to the redirect function by `staticwebapp.config.json`.

## Repository layout

- `src/` contains the Vue application.
- `api/` contains Azure Functions v4 HTTP triggers.
- `prepare-env.ts` generates frontend/backend Auth0 config from environment variables.
- `staticwebapp.config.json` configures the `/!<slug>` redirect rewrite and Node API runtime.
- `.github/workflows/azure-static-web-apps-*.yml` deploys the app to Azure Static Web Apps.

## Runtime requirements

- Node.js 24 or newer for the root app.
- Node.js 20 or newer for the Azure Functions API.
- An Azure subscription. The Azure free account is enough for this demo when you stay inside the free quotas.
- An Auth0 account and tenant.
- A GitHub repository connected to Azure Static Web Apps.

## Environment variables

The build and API expect these variables:

```bash
COSMOSDB_ENDPOINT="https://<account>.documents.azure.com:443/"
COSMOSDB_KEY="<cosmos-db-primary-or-secondary-key>"
COSMOSDB_DATABASE="kiik"
COSMOSDB_COLLECTION="shortlinks"

AUTH0_DOMAIN="<tenant>.<region>.auth0.com"
AUTH0_CLIENT_ID="<auth0-single-page-app-client-id>"
AUTH0_CLIENT_SECRET="<auth0-client-secret-if-needed-by-your-auth0-setup>"
AUTH0_CUSTOM_NAMESPACE="https://<your-domain-or-namespace>"
```

`prepare-env.ts` also fetches `https://$AUTH0_DOMAIN/.well-known/jwks.json` and writes generated files under `src/config/` and `api/common/config/`. These generated files are intentionally ignored by Git.

The Auth0 API audience is currently hard-coded as `https://kiik.api` in `prepare-env.ts` and `api/prepare-env.ts`. Use that exact identifier in Auth0 unless you also change the code.

## Create the Auth0 free tenant

1. Create or sign in to an Auth0 account at `https://auth0.com/`.
2. Create a tenant. Any free/development tenant is enough for this project.
3. Note your tenant domain, for example `dev-example.eu.auth0.com`; this is `AUTH0_DOMAIN`.
4. Go to **Applications > Applications > Create Application**.
5. Choose **Single Page Web Applications**.
6. Copy the application **Client ID** into `AUTH0_CLIENT_ID`.
7. In the application settings, configure:
   - **Allowed Callback URLs**: `http://localhost:8788, https://<your-static-web-app>.azurestaticapps.net`
   - **Allowed Logout URLs**: `http://localhost:8788, https://<your-static-web-app>.azurestaticapps.net`
   - **Allowed Web Origins**: `http://localhost:8788, https://<your-static-web-app>.azurestaticapps.net`
   - **Allowed Origins (CORS)**: `http://localhost:8788, https://<your-static-web-app>.azurestaticapps.net`
8. Save the application.

For local Vite-only development, the frontend may also run on `https://localhost:5173`; add that origin too if you test outside the Static Web Apps CLI.

## Create the Auth0 API and permissions

The backend checks the `permissions` claim in the Auth0 access token. It does not read the OAuth `scope` string directly.

1. Go to **Applications > APIs > Create API**.
2. Set:
   - **Name**: `KiiK API`
   - **Identifier**: `https://kiik.api`
   - **Signing Algorithm**: `RS256`
3. Open the API settings and enable:
   - **Enable RBAC**
   - **Add Permissions in the Access Token**
4. Add these permissions:
   - `add:any_short_url`
   - `list:all_short_url`
5. Create a role, for example `shortener-admin`.
6. Add both permissions to that role.
7. Assign the role to the users who should be allowed to create and list short links.

Without the `permissions` array in the access token, the backend returns `WRONG PERMISSION`.

## Add social authentication providers in Auth0

Auth0 calls external identity providers "Connections". For each provider below, create an OAuth application on the provider side, then paste the client credentials into Auth0.

In Auth0, go to **Authentication > Social**, choose the provider, configure it, and enable it for the KiiK Single Page Application.

### Google

1. In Google Cloud Console, create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a web application.
4. Add the Auth0 callback URL shown in the Auth0 Google connection settings. It usually looks like:

```text
https://<AUTH0_DOMAIN>/login/callback
```

5. Copy the Google Client ID and Client Secret into the Auth0 Google connection.
6. Enable the connection for the KiiK application.

### GitHub

1. In GitHub, go to **Settings > Developer settings > OAuth Apps > New OAuth App**.
2. Set the homepage URL to your Static Web App URL.
3. Set the authorization callback URL to the callback URL shown by Auth0, usually:

```text
https://<AUTH0_DOMAIN>/login/callback
```

4. Copy the GitHub Client ID and Client Secret into the Auth0 GitHub connection.
5. Enable the connection for the KiiK application.

### Microsoft

1. In Microsoft Entra admin center, create an app registration.
2. Add a web redirect URI using the Auth0 callback URL:

```text
https://<AUTH0_DOMAIN>/login/callback
```

3. Create a client secret.
4. Copy the Application (client) ID and secret into the Auth0 Microsoft connection.
5. Enable the connection for the KiiK application.

### Facebook

1. In Meta for Developers, create an app.
2. Add Facebook Login.
3. Add the Auth0 callback URL as a valid OAuth redirect URI:

```text
https://<AUTH0_DOMAIN>/login/callback
```

4. Copy the Facebook App ID and App Secret into the Auth0 Facebook connection.
5. Enable the connection for the KiiK application.

Auth0 development keys are convenient for tests, but for a real deployment you should use your own provider keys so you control consent screens, quotas, branding, and production behavior.

## Create Azure resources on the free tier

This project can run on:

- Azure Static Web Apps Free plan for the Vue frontend and managed Azure Functions API.
- Azure Cosmos DB for NoSQL with free tier enabled. The current Microsoft free tier grants the first 1000 RU/s and 25 GB storage free on the account, but always check Azure pricing before production use.

### 1. Create the Cosmos DB account

In the Azure portal:

1. Create an **Azure Cosmos DB for NoSQL** account.
2. Enable **Free Tier discount** when creating the account.
3. Use provisioned throughput, not serverless, because Cosmos DB free tier is not available for serverless accounts.
4. Create a database, for example `kiik`.
5. Create a container, for example `shortlinks`.
6. Use `/auth0Domain_hash` as the partition key.
7. Use manual throughput such as `400 RU/s`.
8. Enable container TTL. Use default TTL `-1` so items only expire when they contain their own `ttl` property.

The code writes documents shaped like this:

```json
{
  "name": "AbC12",
  "value": "https://example.com/a/very/long/url",
  "description": "Example link",
  "expiration": 1760000000000,
  "auth0Domain_hash": 123456789,
  "ttl": 86400
}
```

The redirect path does not manually compare dates; expiration depends on Cosmos DB TTL removing expired documents.

### 2. Create the Azure Static Web App

In the Azure portal:

1. Create a **Static Web App**.
2. Choose the **Free** hosting plan.
3. Select GitHub as the deployment source.
4. Select your repository and branch, usually `main`.
5. Set build details:
   - **App location**: `/`
   - **API location**: `api`
   - **Output location**: `dist`
6. After Azure creates the GitHub Actions workflow, make sure the workflow uses:
   - `app_build_command: "npm run build"`
   - `api_build_command: "npm run build"`
   - `api_location: "api"`

The repository already contains a workflow with these settings. If Azure creates a new workflow or a new deployment token secret name, keep the Azure-generated token name and copy the environment variable block from the existing workflow.

### 3. Add GitHub repository secrets

Add these secrets under **GitHub repository > Settings > Secrets and variables > Actions**:

```text
AUTH0_DOMAIN
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_CUSTOM_NAMESPACE
COSMOSDB_ENDPOINT
COSMOSDB_KEY
COSMOSDB_DATABASE
COSMOSDB_COLLECTION
```

Azure also creates an `AZURE_STATIC_WEB_APPS_API_TOKEN_...` secret for deployment. Keep the name that your workflow references.

### 4. Add Azure Static Web Apps application settings

The GitHub secrets are used at build time. The API also needs runtime settings in Azure.

In the Static Web App resource, open **Configuration** and add:

```text
AUTH0_DOMAIN
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_CUSTOM_NAMESPACE
COSMOSDB_ENDPOINT
COSMOSDB_KEY
COSMOSDB_DATABASE
COSMOSDB_COLLECTION
```

Save the settings and redeploy or restart the app.

### 5. Deploy

Push to the production branch configured in the workflow:

```bash
git push origin main
```

GitHub Actions builds the Vue app, builds the API, generates Auth0/JWKS config files, and uploads everything to Azure Static Web Apps.

After the first deployment, update the Auth0 application URLs with the final Static Web Apps URL, then run the workflow again so the generated config matches your tenant.

## Run locally

Install dependencies:

```bash
npm install
```

Export the required environment variables in your shell:

```bash
export AUTH0_DOMAIN="<tenant>.<region>.auth0.com"
export AUTH0_CLIENT_ID="<client-id>"
export AUTH0_CLIENT_SECRET="<client-secret-if-used>"
export AUTH0_CUSTOM_NAMESPACE="https://<your-domain-or-namespace>"
export COSMOSDB_ENDPOINT="https://<account>.documents.azure.com:443/"
export COSMOSDB_KEY="<key>"
export COSMOSDB_DATABASE="kiik"
export COSMOSDB_COLLECTION="shortlinks"
```

Generate a local HTTPS certificate if you want the configured local SWA command:

```bash
npm run create-cert
```

Start the app through the Azure Static Web Apps CLI:

```bash
npm run start
```

The app is served on:

```text
https://localhost:8788
```

If you only need the Vite frontend while working on UI changes:

```bash
npm run dev
```

## Use the backend directly with a valid token

The API is anonymous at the Azure Functions level, but protected by Auth0 JWT validation in the function code. A valid access token must:

- Be issued by `https://<AUTH0_DOMAIN>/`.
- Be signed with the tenant RS256 key from `/.well-known/jwks.json`.
- Use the `https://kiik.api` audience.
- Be within its `iat` and `exp` validity window.
- Contain a `permissions` array with the required permission.

Because Azure Static Web Apps may replace the standard `Authorization` header, send the token in `Auth0-Authorization`. Sending both headers is fine.

### Get a token from the UI session

The simplest direct-use workflow is:

1. Sign in through the deployed UI.
2. Use the browser devtools or a small temporary frontend snippet to read the access token from the Auth0 SPA SDK.
3. Call the backend with that token.

The token must include the role permissions configured above.

### Create a short URL

```bash
TOKEN="<valid-auth0-access-token>"
BASE_URL="https://<your-static-web-app>.azurestaticapps.net"

curl -X POST "$BASE_URL/api/add-short-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Auth0-Authorization: Bearer $TOKEN" \
  -d '{
    "url": "https://example.com/a/very/long/url",
    "ttl": "86400",
    "description": "Example link"
  }'
```

Successful response:

```json
{
  "message": "Link shortened successfully",
  "slug": "AbC12",
  "url": "https://example.com/a/very/long/url",
  "shortened": "https://<your-static-web-app>.azurestaticapps.net/AbC12",
  "expiration": 1760000000000
}
```

The UI displays links as `https://<host>/!<slug>`. For direct redirects, prefer the bang form:

```text
https://<your-static-web-app>.azurestaticapps.net/!AbC12
```

### List short URLs

```bash
TOKEN="<valid-auth0-access-token>"
BASE_URL="https://<your-static-web-app>.azurestaticapps.net"

curl -X POST "$BASE_URL/api/list-short-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Auth0-Authorization: Bearer $TOKEN" \
  -d '{}'
```

The token must contain `list:all_short_url`.

### Redirect without the UI

Redirects are public and do not require Auth0:

```bash
curl -I "https://<your-static-web-app>.azurestaticapps.net/!AbC12"
```

You can also call the API route directly:

```bash
curl -I "https://<your-static-web-app>.azurestaticapps.net/api/redirect?to=AbC12"
```

## Useful implementation notes

- Slugs are generated with `nanoid` using five characters from `a-z`, `A-Z`, `0-9`, and `-`.
- Links are scoped by a hash of `AUTH0_DOMAIN`, so one deployed instance is expected to use one Auth0 tenant.
- `add-short-url` requires `add:any_short_url`.
- `list-short-url` requires `list:all_short_url`.
- `prepare-env` copies `src/auth0/TokenHelper.ts` into `api/common/auth0/TokenHelper.ts` so the frontend and backend use the same permission constants and JWT checks.

## Official documentation

- Azure Static Web Apps hosting plans: https://learn.microsoft.com/azure/static-web-apps/plans
- Azure Cosmos DB free tier: https://learn.microsoft.com/azure/cosmos-db/free-tier
- Auth0 RBAC for APIs: https://auth0.com/docs/manage-users/access-control/configure-core-rbac/enable-role-based-access-control-for-apis
- Auth0 social connections: https://auth0.com/docs/authenticate/identity-providers/social-identity-providers

## License

- This project code is released under the MIT license.
- Third-party dependencies and assets remain under their own licenses.
