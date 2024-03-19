import {
  BedrockAgentClient,
  CreateDataSourceCommand,
  CreateDataSourceResponse,
  CreateKnowledgeBaseCommand,
  CreateKnowledgeBaseCommandInput,
  CreateKnowledgeBaseResponse,
  ListDataSourcesCommand,
  ListDataSourcesResponse,
  ListKnowledgeBasesCommand,
  ListKnowledgeBasesResponse,
  StartIngestionJobCommand,
  StartIngestionJobCommandOutput,
} from "@aws-sdk/client-bedrock-agent";
import { logger } from "../utils/pt";
import { VectorStore } from "./vectorStore";


const bedrockAgentClient = new BedrockAgentClient();

export class BedrockKnowledgeBase {
  private readonly knowledgeBaseId: string;
  private readonly dataSourceId: string;

  constructor(knowledgeBaseId: string, kbDataSourceId: string) {
    this.knowledgeBaseId = knowledgeBaseId;
    this.dataSourceId = kbDataSourceId;
  }

  static async getKnowledgeBase(kbName: string): Promise<BedrockKnowledgeBase> {

    const kbDataSourceName = `${kbName}-datasource`;

    //check if a kb already exists
    let knowledgeBaseId = await BedrockKnowledgeBase.getKnowledgeBaseFromName(kbName);
    if (!knowledgeBaseId) {
      //Setup knowledgeBase if it does not exist already
      logger.info(`KnowledgeBase: ${kbName} does not exist, creating`);
      const vectorStore = await VectorStore.getVectorStore(kbName);
      knowledgeBaseId = await BedrockKnowledgeBase.createKnowledgeBase(kbName, vectorStore.indexName);
    }
    //check if the KB was configured
    let kbDataSourceId = await BedrockKnowledgeBase.getKBDataSource(knowledgeBaseId, kbDataSourceName);
    if (!kbDataSourceId) {
      kbDataSourceId = await BedrockKnowledgeBase.createDataSource(kbName, knowledgeBaseId, kbDataSourceName);
    }
    //TODO save all the Knowledgebase / Opensearch index configuration in a database
    return new BedrockKnowledgeBase(knowledgeBaseId, kbDataSourceId);
  }

  private static async createDataSource(kbName: string, knowledgeBaseId: string, kbDataSourceName: string): Promise<string> {
    //Create datasource
    const createDataSourceCommand = new CreateDataSourceCommand({
      dataSourceConfiguration: {
        type: "S3",
        s3Configuration: {
          bucketArn: `arn:aws:s3:::${process.env.KB_STAGING_BUCKET}`,
          inclusionPrefixes: [kbName],
        },
      },
      vectorIngestionConfiguration: {
        chunkingConfiguration: {
          chunkingStrategy: "FIXED_SIZE",
          fixedSizeChunkingConfiguration: {
            "maxTokens": 512,
            "overlapPercentage": 20,
          },
        },
      },
      knowledgeBaseId: knowledgeBaseId,
      name: kbDataSourceName,
    });

    // noinspection TypeScriptValidateTypes
    let createDSResponse: CreateDataSourceResponse = await bedrockAgentClient.send(createDataSourceCommand);
    logger.info("DataSource created", createDSResponse as any);

    if (!(createDSResponse.dataSource && createDSResponse.dataSource.dataSourceId)) {
      throw new Error("dataSourceId was not present in the response");
    }

    return createDSResponse.dataSource.dataSourceId;
  }

  private static async createKnowledgeBase(kbName: string, vectorIndexName: string) {
    const createKbRequest = new CreateKnowledgeBaseCommand({
      name: kbName,
      knowledgeBaseConfiguration: {
        type: "VECTOR",
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:${process.env.AWS_REGION}::foundation-model/amazon.titan-embed-text-v1`,
        },
      },
      roleArn: process.env.BEDROCK_ROLE_ARN,
      storageConfiguration: {
        "type": "OPENSEARCH_SERVERLESS",
        "opensearchServerlessConfiguration": {
          "collectionArn": process.env.OPSS_COLLECTION_ARN,
          "vectorIndexName": vectorIndexName,
          "fieldMapping": {
            "vectorField": "vector",
            "textField": "text",
            "metadataField": "text-metadata",
          },
        },
      },
    });
    // noinspection TypeScriptValidateTypes
    logger.info("KB creating", { request: createKbRequest });

    // noinspection TypeScriptValidateTypes
    const createKbResponse: CreateKnowledgeBaseResponse = await bedrockAgentClient.send<CreateKnowledgeBaseCommandInput, CreateKnowledgeBaseResponse>(createKbRequest);

    // noinspection TypeScriptValidateTypes
    logger.info("KB Created", { response: createKbResponse });

    if (!(createKbResponse.knowledgeBase && createKbResponse.knowledgeBase.knowledgeBaseId)) {
      throw new Error("KB id not present in the response");
    }

    return createKbResponse.knowledgeBase.knowledgeBaseId;
  }

  private static async getKBDataSource(knowledgeBaseId: string, kbDataSourceName: string) {
    let listDataSourcesCommand = new ListDataSourcesCommand({ knowledgeBaseId: knowledgeBaseId, maxResults: 1000 });
    // noinspection TypeScriptValidateTypes
    const listDataSourcesResponse: ListDataSourcesResponse = await bedrockAgentClient.send(listDataSourcesCommand);
    logger.info(listDataSourcesResponse as any);

    let dataSourceSummaries = listDataSourcesResponse.dataSourceSummaries;
    if (dataSourceSummaries !== undefined && dataSourceSummaries.length > 0) {
      let dataSourceSummary = dataSourceSummaries.find((summary) => summary.name === kbDataSourceName);
      return dataSourceSummary.dataSourceId;
    }
    return undefined;
  }

  private static async getKnowledgeBaseFromName(kbName: string) {
    //TODO sanitise and hash input + store in DB for easier lookup
    const listKnowledgeBasesCommand = new ListKnowledgeBasesCommand({
      maxResults: 1000,
    });

    // noinspection TypeScriptValidateTypes
    const response: ListKnowledgeBasesResponse = await bedrockAgentClient.send(listKnowledgeBasesCommand);
    // noinspection TypeScriptValidateTypes
    logger.info("KB output:", { data: response });

    // if the knowledge base does not exist, go and create one
    if (response.knowledgeBaseSummaries !== undefined && response.knowledgeBaseSummaries.length > 0) {
      const knowledgeBaseSummary = response.knowledgeBaseSummaries.find((kbSummary) => kbSummary.name === kbName);
      return knowledgeBaseSummary.knowledgeBaseId;
    }
    //return undefined in case there is no existing KnowledgeBase configured for the provided kbName
    return undefined;
  }

  async ingestDocuments() {

    //Start ingestion into KB
    const startIngestionJobCommand = new StartIngestionJobCommand({
      dataSourceId: this.dataSourceId,
      knowledgeBaseId: this.knowledgeBaseId,
    });

    // noinspection TypeScriptValidateTypes
    const startIngestionResponse: StartIngestionJobCommandOutput = await bedrockAgentClient.send<StartIngestionJobCommandOutput>(startIngestionJobCommand);
    logger.info(startIngestionResponse as any);
    return startIngestionResponse;
  }
}