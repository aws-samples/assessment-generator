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

import { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { AppSyncResolverEvent, Context, S3EventRecord } from 'aws-lambda';
import { StartIngestionJobCommandOutput } from '@aws-sdk/client-bedrock-agent';
import { CopyObjectCommand, CopyObjectOutput, S3Client } from "@aws-sdk/client-s3";
import { logger, tracer } from "./utils/pt";
import { BedrockKnowledgeBase } from "./kb/bedrockKnowledgeBase";
import { KBCreationRequest } from "./definitions/kbCreationRequest";
import { AppSyncIdentityCognito } from "aws-lambda/trigger/appsync-resolver";


const s3Client = new S3Client();

class Lambda implements LambdaInterface {
  /**
   * @param event the received AppSyncResolver event, wrapping the KB creation request
   * @param lambdaContext the Context provided by Lambda
   */
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: AppSyncResolverEvent<KBCreationRequest>, lambdaContext: Context): Promise<StartIngestionJobCommandOutput> {

    let kbCreationRequest = event.arguments;

    await this.copyObjects(kbCreationRequest.locations);
    const identity = event.identity as AppSyncIdentityCognito;
    const userId = identity.sub;

    const knowledgeBase = await BedrockKnowledgeBase.getKnowledgeBase(userId, kbCreationRequest.courseId);

    return await knowledgeBase.ingestDocuments();
  }

  private async copyObjects(objectKeys: string[]) {
    for (let i = 0; i < objectKeys.length; i++) {
      const objectKey = objectKeys[i];
      const newObjectKey = objectKey.replace("KnowledgeBases/", "");
      logger.info({ objectKey, newObjectKey } as any);
      //Upload file to destination S3 bucket
      const copyObjectRequest = {
        CopySource: `${process.env.ARTIFACTS_UPLOAD_BUCKET}/public/${objectKey}`,
        Bucket: process.env.KB_STAGING_BUCKET,
        Key: newObjectKey,
      };
      logger.info("Copy object to target bucket", copyObjectRequest as any);
      const copyObjectCommand = new CopyObjectCommand(copyObjectRequest);
      const copyObjectOutput = await s3Client.send<CopyObjectOutput>(copyObjectCommand);
      logger.info("CopyObject result", { data: copyObjectOutput } as any);
    }
  }
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
