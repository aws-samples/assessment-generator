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
import { BedrockRuntime, InvokeModelCommandOutput, InvokeModelResponse } from "@aws-sdk/client-bedrock-runtime";
import { AssessmentTemplate } from "./models/assessmentTemplate";


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
    let generatedQuestions = await this.generateInitialQuestions(topicsExtractionOutput, referenceDocuments.assessmentTemplate);

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

  private async generateInitialQuestions(topicsExtractionOutput: string, assessmentTemplate: AssessmentTemplate) {

    let prompt =`
Craft a multiple-choice questionnaire (${assessmentTemplate.totalQuestions} questions)  for a university student based on the Provided Summarised Transcript.
Build ${assessmentTemplate.easyQuestions} easy, ${assessmentTemplate.mediumQuestions} medium, and ${assessmentTemplate.hardQuestions} hard questions.
The questionnaire should be in the ISO 639-2 Code: ${assessmentTemplate.docLang}
The text below is a summarised transcript of the lecture that the teacher provided today
The answer choices must be around the topics covered in the lecture.
The question must be focused the topics covered in the lecture and not on general topics around the subject.
Test the examinee's understanding of essential concepts mentioned in the transcript.
Follow these guidelines:
Ensure that only one answer is correct.

Formulate a question that probes knowledge of the Core Concepts.
Present four answer choices labeled as A, B, C, and D.
Indicate the correct answer labeled as 'answer'.
Articulate a reasoned and concise defense for your chosen answer without relying on direct references to the text labeled as "explanation"

Structure your response in this format:
\`\`\`xml
<questions>
    <question>
        <questionText>
            [Question]
        </questionText>
        <answers>
            <answer>
                <answerText>[Option A]</answerText>
            </answer>
            <answer>
                <answerText>[Option B]</answerText>
            </answer>
            <answer>
                <answerText>[Option C]</answerText>
            </answer>
            <answer>
                <answerText>[Option D]</answerText>
            </answer>
        </answers>
        <correctAnswer>[Correct Answer Letter]</correctAnswer>
        <explaination>[Explanation for Correctness]</explaination>
    </question>
    <!-- all other questions below   -->
</questions>
\`\`\`
    `
    prompt+= `Provided Summarised Transcript: \n ${topicsExtractionOutput}`;

    logger.info(prompt);
    let llmResponse  = await callLLM(CLAUDE_3_HAIKU, prompt);
    logger.info(llmResponse);
    return llmResponse;
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

  //TODO find out what Types we should expect
  let text = response.body.transformToString();
  logger.info(text);
  const modelRes = JSON.parse(text);
  let contentElementElement = modelRes.content[0]["text"];

  return contentElementElement;
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
