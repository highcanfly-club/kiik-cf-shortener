# Demo project for a simple link shortener with Azure Static Web Apps+CosmosDB+Auth0+Vue+TailwindCss

## Howto

- You need:
  - An Azure subscription (even free one)
  - A CosmosDB container (free tier is OK)
  - An Auth0 account (free is OK)
    - an Application defined at Auth0
    - an API defined at Auth0 with add:any_short_url and list:any_short_url permissions
    - a user or a way to automatic add it
    - 
- defines this environment variable at Azure and as Github secrets
```javascript
    "COSMOSDB_ENDPOINT": "https://ACCOUNT.documents.azure.com:443/",
    "COSMOSDB_KEY": "writing key",
    "COSMOSDB_DATABASE": "cosmosdb db name",
    "COSMOSDB_COLLECTION": "cosmosdb container name",
    "AUTH0_DOMAIN": "yourtenant.yourregion.auth0.com",
    "AUTH0_CLIENT_ID": "auth0 client id",
    "AUTH0_CLIENT_SECRET": "auth0 client secret",
    "AUTH0_CUSTOM_NAMESPACE": "https://yourdomain.tld"
```
- deploy to Azure Static Web with the VSCode Azure functions or the swa CLI


### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Azure pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-node-azure-pack)

### License

- [MIT](https://github.com/eltorio/vue-vite-tailwindcss-fontawesome/blob/main/LICENSE.md) for my work
- others are under their own license
