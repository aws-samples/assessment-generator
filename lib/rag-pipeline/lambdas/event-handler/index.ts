/*
 * Copyright (C) 2023 Amazon.com, Inc. or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InvalidDocumentObjectException, ObjectNotFoundException } from './exceptions';
import { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Context, S3Event, S3EventRecord, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda';
import { BatchProcessor, EventType, processPartialResponse } from '@aws-lambda-powertools/batch';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Logger } from '@aws-lambda-powertools/logger';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import {
  BedrockAgentClient,
  CreateDataSourceCommand,
  CreateDataSourceResponse,
  CreateKnowledgeBaseCommand,
  CreateKnowledgeBaseCommandInput,
  CreateKnowledgeBaseResponse,
  KnowledgeBaseSummary,
  ListDataSourcesCommand,
  ListDataSourcesResponse,
  ListKnowledgeBasesCommand,
  ListKnowledgeBasesResponse,
  StartIngestionJobCommand,
  StartIngestionJobCommandOutput,
} from '@aws-sdk/client-bedrock-agent';
import { CopyObjectCommand, CopyObjectOutput, S3Client } from "@aws-sdk/client-s3";

import { Client } from '@opensearch-project/opensearch';
import { DocumentEvent } from "./s3/documentEvent";

/**
 * Creating a global instance for the Powertools logger
 * to be used across the different applications.
 */
export const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

/**
 * Creating a global instance for the Powertools metrics
 * to be used across the different applications.
 */
export const metrics = new Metrics({
  defaultDimensions: {
    region: process.env.AWS_REGION ?? 'N/A',
    executionEnv: process.env.AWS_EXECUTION_ENV ?? 'N/A',
  },
});

/**
 * Creating a global instance for the Powertools tracer
 * to be used across the different applications.
 */
export const tracer = new Tracer();

/**
 * The async batch processor processes the received
 * events from SQS in parallel.
 */
const processor = new BatchProcessor(EventType.SQS);

/**
 * @param type the S3 event type.
 * @returns the corresponding event type in the context of
 * the cloud event specification.
 */
const getEventType = (type: string): DocumentEvent => {
  if (type.startsWith('ObjectCreated')) {
    return (DocumentEvent.DOCUMENT_CREATED);
  } else if (type.startsWith('ObjectRemoved')) {
    return (DocumentEvent.DOCUMENT_DELETED);
  } else {
    throw new Error(`Unsupported S3 event type: ${type}`);
  }
};

/**
 * When S3 emits an event, it will encode the object key
 * in the event record using quote-encoding.
 * This function restores the object key in its unencoded
 * form and returns the event record with the unquoted object key.
 * @param event the S3 event record.
 * @returns the S3 event record with the unquoted object key.
 */
const unquote = (event: S3EventRecord): S3EventRecord => {
  event.s3.object.key = decodeURIComponent(event.s3.object.key.replace(/\+/g, " "));
  return (event);
};

const bedrockAgentClient = new BedrockAgentClient();

function kbExist(knowledgeBaseSummaries: KnowledgeBaseSummary[], kbName: string): KnowledgeBaseSummary | undefined {
  return knowledgeBaseSummaries.find((kbSummary) => kbSummary.name === kbName);
}

const s3Client = new S3Client();

/**
 * The lambda class definition containing the lambda handler.
 * @note using a `LambdaInterface` is required in
 * this context in order to be able to use annotations
 * that are only supported on classes and methods.
 */
class Lambda implements LambdaInterface {

  /**
   * @param event the S3 event record.
   * @note the `next` decorator will automatically forward the
   * returned cloud event to the next middlewares
   */
  //TODO Add idempotency
  async s3RecordHandler(s3Event: S3EventRecord): Promise<StartIngestionJobCommandOutput> {
    const event = unquote(s3Event);
    const objectKey = s3Event.s3.object.key;

    // noinspection TypeScriptValidateTypes
    logger.info("Normalised event", { data: { original: objectKey, normalised: event.s3.object.key } });
    const eventType = getEventType(event.eventName);

    //Get file path
    const keyPaths = objectKey.split("/");
    if (keyPaths.length <= 1) {
      // noinspection TypeScriptValidateTypes
      logger.error("Object key has no prefix", { data: s3Event.s3.object });
      throw new Error("Unable to process files at bucket root");
    }
    const kbName = keyPaths[0]; //the prefix of objects corresponds to the Knowledge Base name
    let kbDataSourceName = `${kbName}-datasource`;
    //TODO- sanitise and hash input + store in DB for better lookup

    const listKnowledgeBasesCommand = new ListKnowledgeBasesCommand({
      maxResults: 1000,
    });

    // noinspection TypeScriptValidateTypes
    const response: ListKnowledgeBasesResponse = await bedrockAgentClient.send(listKnowledgeBasesCommand);
    // noinspection TypeScriptValidateTypes
    logger.info("KB output:", { data: response });

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

    // const client = new OpenSearchServerlessClient
    // if the knowledge base does not exist, go and create one
    let knowledgeBaseSummary, knowledgeBaseId, dataSourceId;
    if (response.knowledgeBaseSummaries !== undefined && response.knowledgeBaseSummaries > 0) {
      knowledgeBaseSummary = kbExist(response.knowledgeBaseSummaries, kbName);
      knowledgeBaseId = knowledgeBaseSummary?.knowledgeBaseId;
      let listDataSourcesCommand = new ListDataSourcesCommand({ knowledgeBaseId: knowledgeBaseId, maxResults: 1000 });
      // noinspection TypeScriptValidateTypes
      const listDataSourcesResponse: ListDataSourcesResponse = await bedrockAgentClient.send(listDataSourcesCommand);
      logger.info(listDataSourcesResponse as any);

      let dataSourceSummaries = listDataSourcesResponse.dataSourceSummaries;
      if (dataSourceSummaries) {
        let dataSourceSummary = dataSourceSummaries.find((summary) => summary.name === kbDataSourceName);
        dataSourceId = dataSourceSummary ? dataSourceSummary.dataSourceId : undefined;
      }
    }
    //TODO save all the Knowledgebase / Opensearch index configuration in a database

    if (!(knowledgeBaseSummary)) {
      logger.info(`KnowledgeBase: ${kbName} does not exist, creating`);
      // Create OpenSearchServerless Index
      const settings = {
        "settings": {
          "index.knn": "true",
        },
        "mappings": {
          "properties": {
            "vector": {
              "type": "knn_vector",
              "dimension": 1536,
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

      let apiResponse = await opssClient.indices.exists({ index: kbName });
      logger.info(apiResponse as any);
      if (apiResponse.statusCode == 200) {
        logger.info(`${kbName} exists`);
      } else {
        const indexCreationResponse = await opssClient.indices.create({
          index: kbName,
          body: settings,
        });
        // noinspection TypeScriptValidateTypes
        logger.info("Index Created", { index: indexCreationResponse });
      }

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
            "vectorIndexName": kbName,
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

      knowledgeBaseId = createKbResponse.knowledgeBase?.knowledgeBaseId;

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
      dataSourceId = createDSResponse.dataSource?.dataSourceId;
    }

    //Upload file to destination S3 bucket
    const copyObjectCommand = new CopyObjectCommand({
      CopySource: `${s3Event.s3.bucket.name}/${objectKey}`,
      Bucket: process.env.KB_STAGING_BUCKET,
      Key: objectKey,
    });
    const copyObjectOutput = await s3Client.send<CopyObjectOutput>(copyObjectCommand);

    // noinspection TypeScriptValidateTypes
    logger.info("CopyObject result", { data: copyObjectOutput });

    //Start ingestion into KB
    const startIngestionJobCommand = new StartIngestionJobCommand({
      dataSourceId: dataSourceId,
      knowledgeBaseId: knowledgeBaseId,
    });

    // noinspection TypeScriptValidateTypes
    const startIngestionResponse: StartIngestionJobCommandOutput = bedrockAgentClient.send(startIngestionJobCommand);
    logger.info(startIngestionResponse as any);
    // Construct the initial event that will be consumed
    // by the next middlewares.
    return startIngestionResponse;
  }

  /**
   * @param record an SQS record to process. This SQS record
   * contains at least an S3 event.
   * @return a promise that resolves when all the S3 events
   * contained in the SQS record have been processed.
   */
  async sqsRecordHandler(record: SQSRecord): Promise<any> {
    const event = JSON.parse(record.body) as S3Event;

    // Filter out invalid events.
    if (!Array.isArray(event.Records)) {
      return (Promise.resolve());
    }

    // For each record in the S3 event, we forward them
    // in a normalized way to the next middlewares.
    for (const record of event.Records) {
      try {
        await this.s3RecordHandler(record);
      } catch (err) {
        logger.error(err as any);
        if (err instanceof ObjectNotFoundException
          || err instanceof InvalidDocumentObjectException) {
          // If the S3 object was not found, or is not a file,
          // the event should be ignored.

        } else {
          throw err;
        }
      }
    }
  }

  /**
   * @param event the received SQS records, each wrapping
   * a collection of S3 events.
   * @note the input looks as follows:
   *  SQSEvent { Records: [SqsRecord<S3Event>, ...] }
   */
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: SQSEvent, _: Context): Promise<SQSBatchResponse> {
    return (await processPartialResponse(
      event, this.sqsRecordHandler.bind(this), processor,
    ));
  }
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
