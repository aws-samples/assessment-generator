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
import { BedrockRuntime } from "@aws-sdk/client-bedrock-runtime";


const CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0";

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: APIGatewayProxyEventV2, lambdaContext: Context): Promise<string> {

    if (!event.body) {
      throw new Error("Unable to process the request");
    }
    const referenceDocuments = await ReferenceDocuments.fromJSON(event.body);

    // Extract topics from the Transcript document
    let topicsExtractionOutput = await this.getTopics(referenceDocuments);

    // Generate questions with given values
    let generatedQuestions = await this.generateInitialQuestions(topicsExtractionOutput);

    // Query knowledge base for relevant documents
    // Refine questions/answers and include relevant documents
    let improvedQuestions = await this.improveQuestions(generatedQuestions);

    console.log(topicsExtractionOutput);
    console.log(generatedQuestions);
    console.log(improvedQuestions);
    return "Success";
  }

  private async getTopics(referenceDocuments: ReferenceDocuments) {

    let prompt = `
Extract the key topics covered in the lecture. The lecture content is covered in the documents below.
Tell me the topics of the subject covered, do not include examples used to explain the concept.
For each topic, include a brief description of what was covered.
    `;

    for(let i=0; i<referenceDocuments.documentsContent.length; i++){
      const document = referenceDocuments.documentsContent[i];
      prompt+=`Document ${i}:\n`;
      prompt+= document;
    }
    logger.info(prompt);
    let llmResponse  = await callLLM(CLAUDE_3_HAIKU, prompt);
    logger.info(llmResponse);
    return llmResponse;
  }

  private async generateInitialQuestions(topicsExtractionOutput: string) {
    // TODO
    return Promise.resolve(topicsExtractionOutput);
  }

  private async improveQuestions(generatedQuestions: string) {
    // TODO
    return Promise.resolve(generatedQuestions)
  }
}

const bedrock = new BedrockRuntime();

async function callLLM(modelId, prompt) {
  logger.debug(prompt);
  const body= JSON.stringify( {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 4096,
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": prompt},
        ],
      }
    ],
  })
  const response = await bedrock.invokeModel({
    body: body,
    modelId: modelId,
    accept: "application/json",
    contentType: "application/json",
  });

  const modelRes = JSON.parse(response.body.transformToString());
  return modelRes;
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
