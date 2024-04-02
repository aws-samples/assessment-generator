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
import { AppSyncResolverEvent, Context } from 'aws-lambda';
import { logger, tracer } from "../../../rag-pipeline/lambdas/event-handler/utils/pt";
import { GenerateAssessmentQueryVariables } from "../../../../ui/src/graphql/API";
import { v4 as uuidv4 } from "uuid";
import { InvocationType, InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";


const client = new LambdaClient();

class Lambda implements LambdaInterface {

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: AppSyncResolverEvent<GenerateAssessmentQueryVariables>, lambdaContext: Context): Promise<string> {

    const assessmentId = uuidv4();
    logger.info(event as any);

    // noinspection TypeScriptValidateTypes
    const invokeResponse = await client.send(new InvokeCommand({
      FunctionName: process.env.QA_LAMBDA_NAME,
      InvocationType: InvocationType.Event,
      Payload: JSON.stringify({
        assessmentId: assessmentId,
        ctx: event,
      }),
    }));
    logger.info(invokeResponse);

    //TODO add a row in DDB to indicate "in progress"

    return assessmentId;
  }
}


// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
