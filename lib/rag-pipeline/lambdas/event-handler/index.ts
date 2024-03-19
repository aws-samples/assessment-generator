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
import { StartIngestionJobCommandOutput } from '@aws-sdk/client-bedrock-agent';
import { CopyObjectCommand, CopyObjectOutput, S3Client } from "@aws-sdk/client-s3";
import { DocumentEvent } from "./s3/documentEvent";
import { extractPrefix } from "./utils/extractPrefix";
import { logger, tracer } from "./utils/pt";
import { getEventType } from "./s3/getEventType";
import { BedrockKnowledgeBase } from "./kb/bedrockKnowledgeBase";

/**
 * The async batch processor processes the received
 * events from SQS in parallel.
 */
const processor = new BatchProcessor(EventType.SQS);

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


const s3Client = new S3Client();

/**
 * The lambda class definition containing the lambda handler.
 * @note using a `LambdaInterface` is required in
 * this context in order to be able to use annotations
 * that are only supported on classes and methods.
 */
class Lambda implements LambdaInterface {

  /**
   * @param s3Event the S3 event record.
   * @note the `next` decorator will automatically forward the
   * returned cloud event to the next middlewares
   */
  //TODO Add idempotency
  async s3RecordHandler(s3Event: S3EventRecord): Promise<StartIngestionJobCommandOutput> {
    const event = unquote(s3Event);
    const objectKey = event.s3.object.key;

    logger.info("Normalised event", { data: { original: objectKey, normalised: event.s3.object.key } } as any);

    //TODO validate object types
    const eventType = getEventType(event.eventName);
    if (eventType === DocumentEvent.DOCUMENT_DELETED) {
      return;
    }
    const prefix = extractPrefix(objectKey);


    //Upload file to destination S3 bucket
    const copyObjectRequest = {
      CopySource: `${event.s3.bucket.name}/${objectKey}`,
      Bucket: process.env.KB_STAGING_BUCKET,
      Key: objectKey,
    };
    logger.info("Copy object to target bucket", copyObjectRequest as any);
    const copyObjectCommand = new CopyObjectCommand(copyObjectRequest);
    const copyObjectOutput = await s3Client.send<CopyObjectOutput>(copyObjectCommand);
    logger.info("CopyObject result", { data: copyObjectOutput } as any);

    const knowledgeBase = await BedrockKnowledgeBase.getKnowledgeBase(prefix);
    return await knowledgeBase.ingestDocuments();
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
   * @param lambdaContext the Context provided by Lambda
   * @note the input looks as follows:
   *  SQSEvent { Records: [SqsRecord<S3Event>, ...] }
   */
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: SQSEvent, lambdaContext: Context): Promise<SQSBatchResponse> {
    return (await processPartialResponse(
      event, this.sqsRecordHandler.bind(this), processor,
    ));
  }
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
