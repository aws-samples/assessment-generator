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
  StartIngestionJobCommandOutput, ValidationException,
} from "@aws-sdk/client-bedrock-agent";
import { logger } from "../utils/pt";
import { VectorStore } from "./vectorStore";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const bedrockAgentClient = new BedrockAgentClient();
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const KB_TABLE = process.env.KB_TABLE;

export class BedrockKnowledgeBase {
  private readonly knowledgeBaseId: string;
  private readonly dataSourceId: string;

  constructor(knowledgeBaseId: string, kbDataSourceId: string) {
    this.knowledgeBaseId = knowledgeBaseId;
    this.dataSourceId = kbDataSourceId;
  }

  static async getKnowledgeBase(userId: string, courseId: string): Promise<BedrockKnowledgeBase> {

    // Check DDB Table
    const ddbResponse = await docClient.send(new GetCommand({
      Key: {
        userId,
        courseId,
      },
      TableName: KB_TABLE,
    }));

    if (ddbResponse.Item) {
      logger.info(ddbResponse as any);
      return new BedrockKnowledgeBase(ddbResponse.Item["knowledgeBaseId"], ddbResponse.Item["kbDataSourceId"]);
    }
    const kbName = `${courseId}-${userId}`;
    const s3prefix = `${userId}/${courseId}/`;
    const kbDataSourceName = `${kbName}-datasource`;

    // The Knowledge Base does not exist
    logger.info(`KnowledgeBase: ${userId} does not exist, creating`);
    const vectorStore = await VectorStore.getVectorStore(kbName);
    let knowledgeBaseId = await BedrockKnowledgeBase.createKnowledgeBase(kbName, vectorStore.indexName);
    let kbDataSourceId = await BedrockKnowledgeBase.createDataSource(knowledgeBaseId, kbDataSourceName, s3prefix);

    const storeKBResponse = await docClient.send(new PutCommand({
      TableName: KB_TABLE,
      Item: {
        userId,
        courseId,
        knowledgeBaseId,
        kbDataSourceId,
        indexName: vectorStore.indexName,
        s3prefix,
      },
    }));

    return new BedrockKnowledgeBase(knowledgeBaseId, kbDataSourceId);
  }

  private static async createDataSource(knowledgeBaseId: string, kbDataSourceName: string, s3prefix: string): Promise<string> {
    //Create datasource
    const createDataSourceCommand = new CreateDataSourceCommand({
      dataSourceConfiguration: {
        type: "S3",
        s3Configuration: {
          bucketArn: `arn:aws:s3:::${process.env.KB_STAGING_BUCKET}`,
          inclusionPrefixes: [s3prefix],
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

    const createKbResponse = await this.createKBWithRetry(createKbRequest);
    // noinspection TypeScriptValidateTypes
    logger.info("KB Created", { response: createKbResponse });

    if (!(createKbResponse.knowledgeBase && createKbResponse.knowledgeBase.knowledgeBaseId)) {
      throw new Error("KB id not present in the response");
    }

    return createKbResponse.knowledgeBase.knowledgeBaseId;
  }

  private static async createKBWithRetry(createKbRequest: CreateKnowledgeBaseCommand): Promise<CreateKnowledgeBaseResponse> {
    const MAX_ATTEMPTS = 3;
    const WAIT_MS = 5000;
    let attempts = 0;
    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      try {
        // noinspection TypeScriptValidateTypes
        logger.info(`Attempt ${attempts}. KB creating`, { request: createKbRequest });
        // noinspection TypeScriptValidateTypes
        const createKbResponse = await bedrockAgentClient.send<CreateKnowledgeBaseCommandInput, CreateKnowledgeBaseResponse>(createKbRequest);
        return createKbResponse;
      } catch (e) {
        logger.info(e);
        if ((e instanceof ValidationException) && e.message.includes("no such index")) {
          logger.info("Index still creating, wait and retry");
          await new Promise(resolve => {
            return setTimeout(resolve, WAIT_MS);
          });
        } else {
          //non-retryable error
          throw e;
        }
      }
    }
    throw new Error(`Unable to create KB after ${MAX_ATTEMPTS} attempts`);
  }

  private static async getKBDataSource(knowledgeBaseId: string, kbDataSourceName: string) {
    let listDataSourcesCommand = new ListDataSourcesCommand({ knowledgeBaseId: knowledgeBaseId, maxResults: 1000 });
    // noinspection TypeScriptValidateTypes
    const listDataSourcesResponse: ListDataSourcesResponse = await bedrockAgentClient.send(listDataSourcesCommand);
    logger.info(listDataSourcesResponse as any);

    let dataSourceSummaries = listDataSourcesResponse.dataSourceSummaries;
    if (dataSourceSummaries !== undefined && dataSourceSummaries.length > 0) {
      let dataSourceSummary = dataSourceSummaries.find((summary) => summary.name === kbDataSourceName);
      return dataSourceSummary?.dataSourceId;
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
      return knowledgeBaseSummary?.knowledgeBaseId;
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