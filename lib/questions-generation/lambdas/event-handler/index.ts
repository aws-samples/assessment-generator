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
import { ReferenceDocuments } from "./models/referenceDocuments";
import { DataService } from "./services/dataService";
import { GenAiService } from "./services/genAiService";
import { GenerateAssessmentQueryVariables } from "../../../../ui/src/graphql/API";
import { AppSyncIdentityCognito } from "aws-lambda/trigger/appsync-resolver";


const dataService = new DataService();

class WrappedAppSyncEvent {
  assessmentId: string;
  ctx: AppSyncResolverEvent<GenerateAssessmentQueryVariables>;
}

class Lambda implements LambdaInterface {
  knowledgeBaseId: string;

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: WrappedAppSyncEvent, lambdaContext: Context): Promise<string> {
    //TODO implement mechanism to update the table with Status:failed in case of errors

    let assessmentId = event.assessmentId;
    const ctx = event.ctx;
    const generateAssessmentInput = ctx.arguments.input;
    logger.info(generateAssessmentInput as any);

    const identity = ctx.identity as AppSyncIdentityCognito;
    const userId = identity.sub;

    if (!generateAssessmentInput) {
      throw new Error("Unable to process the request");
    }
    const referenceDocuments = await ReferenceDocuments.fromRequest(generateAssessmentInput, userId);
    this.knowledgeBaseId = referenceDocuments.knowledgeBaseId;
    const genAiService = new GenAiService(this.knowledgeBaseId);

    // Extract topics from the Transcript document
    const topicsExtractionOutput = await genAiService.getTopics(referenceDocuments);

    // Generate questions with given values
    const generatedQuestions = await genAiService.generateInitialQuestions(topicsExtractionOutput, referenceDocuments.assessmentTemplate);

    // Query knowledge base for relevant documents
    // Refine questions/answers and include relevant documents
    // consideration - could lose the context because the improvement is 1 by 1
    const improvedQuestions = await genAiService.improveQuestions(generatedQuestions);

    logger.info(improvedQuestions as any);

    assessmentId = await dataService.updateAssessment(improvedQuestions, userId, assessmentId);
    logger.info(`Assessment generated: ${assessmentId}`);
    return assessmentId;
  }
}


// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
