// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
 
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
import { GenerateAssessmentInput, GenerateAssessmentQueryVariables } from "../../../../ui/src/graphql/API";
import { AppSyncIdentityCognito } from "aws-lambda/trigger/appsync-resolver";

class WrappedAppSyncEvent {
  assessmentId: string;
  ctx: AppSyncResolverEvent<GenerateAssessmentQueryVariables>;
}

class Lambda implements LambdaInterface {
  knowledgeBaseId: string;
  private dataService: DataService;

  constructor() {
    this.dataService = new DataService();
  }

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: WrappedAppSyncEvent, lambdaContext: Context): Promise<string> {

    let assessmentId = event.assessmentId;
    const ctx = event.ctx;
    const generateAssessmentInput = ctx.arguments.input;
    logger.info(generateAssessmentInput as any);

    const identity = ctx.identity as AppSyncIdentityCognito;
    const userId = identity.sub;

    if (!generateAssessmentInput) {
      throw new Error("Unable to process the request");
    }
    try {
      return await this.processEvent(generateAssessmentInput, userId, assessmentId);
    } catch (e) {
      await this.dataService.updateFailedAssessment(userId, assessmentId);
      throw e;
    }
  }

  private async processEvent(generateAssessmentInput: GenerateAssessmentInput, userId: string, assessmentId: string) {
    const referenceDocuments = await ReferenceDocuments.fromRequest(generateAssessmentInput, userId);
    this.knowledgeBaseId = referenceDocuments.knowledgeBaseId;
    const genAiService = new GenAiService(this.knowledgeBaseId);

    // Extract topics from the Transcript document
    const topicsExtractionOutput = await genAiService.getTopics(referenceDocuments);

    // Generate questions with given values
    const generatedQuestions = await genAiService.generateInitialQuestions(topicsExtractionOutput, referenceDocuments.assessmentTemplate);

    // Query knowledge base for relevant documents
    // Refine questions/answers and include relevant documents
    const improvedQuestions = await genAiService.improveQuestions(generatedQuestions);

    logger.info(improvedQuestions as any);

    assessmentId = await this.dataService.updateAssessment(improvedQuestions, userId, assessmentId);
    logger.info(`Assessment generated: ${assessmentId}`);
    return assessmentId;
  }
}


// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
