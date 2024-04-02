import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Client } from "@opensearch-project/opensearch";
import { logger } from "../utils/pt";


const opssHost = process.env.OPSS_HOST;
let awsSigv4SignerResponse = AwsSigv4Signer({
  region: process.env.AWS_REGION,
  service: "aoss",
  getCredentials: () => {
    const credentialsProvicer = defaultProvider();
    return credentialsProvicer();
  },
});
const opssClient = new Client({
  requestTimeout: 60000,
  node: opssHost,
  Connection: awsSigv4SignerResponse.Connection,
  Transport: awsSigv4SignerResponse.Transport,
});
const settings = {
  "settings": {
    "index.knn": "true",
  },
  "mappings": {
    "properties": {
      "vector": {
        "type": "knn_vector",
        "dimension": 1536,
        "method": {
          "engine": "faiss",
          "name": "hnsw"
        },
      },
      "text": {
        "type": "text",
      },
      "text-metadata": {
        "type": "text",
      },
    },
  },
};

export class VectorStore {
  readonly indexName: string;

  constructor(indexName: string) {
    this.indexName = indexName;
  }

  static async getVectorStore(indexName: string): Promise<VectorStore> {

    let apiResponse = await opssClient.indices.exists({ index: indexName });

    logger.info(apiResponse as any);
    if (apiResponse.statusCode == 200) {
      logger.info(`${indexName} exists`);
      return new VectorStore(indexName);
    } else {
      logger.info(`${indexName} does not exists, creating`);
      //create the index
      const indexCreationResponse = await opssClient.indices.create({
        index: indexName,
        body: settings,
      });
      // noinspection TypeScriptValidateTypes
      logger.info("Index Created", { index: indexCreationResponse });
      return new VectorStore(indexName);
    }
  }
}