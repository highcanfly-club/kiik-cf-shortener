import { CosmosClient } from "@azure/cosmos";
export type ResourceNameValue = { name: string; value: string;};
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
  return new Promise<ResourceNameValue>((resolve, reject) => {
    container.items
      .query<ResourceNameValue>(querySpec, {})
      .fetchNext()
      .then((results) => {
        if (
          results.resources &&
          results.resources[0] &&
          results.resources[0].name &&
          results.resources[0].value
        ) {
          resolve({
            name: results.resources[0].name,
            value: results.resources[0].value,
          });
        } else {
          reject(results);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
