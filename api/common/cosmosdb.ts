import { CosmosClient } from "@azure/cosmos";
const options = {
  endpoint: process.env.COSMOSDB_ENDPOINT,
  key: process.env.COSMOSDB_KEY,
  userAgentSuffix: "KiiK",
};

const client = new CosmosClient(options);
const container = client
  .database(process.env.COSMOSDB_DATABASE)
  .container(process.env.COSMOSDB_COLLECTION);

export const getLongUrl = (shortlink: string) => {
  const querySpec = {
    query:
      "SELECT c.name,c['value'] FROM c WHERE c.name=@shortLink AND c.auth0Domain_hash=@hash",
    parameters: [
      {
        name: "@shortLink",
        value: shortlink,
      },
      {
        name: "@hash",
        value: 8650185859121402,
      },
    ],
  };
  return new Promise<{ name: string; value: string }>((resolve) => {
    container.items
      .query<{ name: string; value: string }>(querySpec, {})
      .fetchNext()
      .then((results) => {
        resolve({
          name: (results.resources[0].name),
          value: (results.resources[0].value),
        });
      });
  });
};
