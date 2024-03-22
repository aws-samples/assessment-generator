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
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { logger, tracer } from "../../../rag-pipeline/lambdas/event-handler/utils/pt";
import { ReferenceDocuments } from "./models/referenceDocuments";


class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: APIGatewayProxyEventV2, lambdaContext: Context): Promise<string> {

    if (!event.body) {
      throw new Error("Unable to process the request");
    }
    const referenceDocuments = await ReferenceDocuments.fromJSON(event.body);

    logger.info("Documents", referenceDocuments as any);

    // Extract topics from the Transcript document


    // Generate questions with given values

    // Query knowledge base for relevant documents

    // Refine questions/answers and include relevant documents

    return "Success";
  }
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
