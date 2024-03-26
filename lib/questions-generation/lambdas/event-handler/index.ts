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
import { BedrockAgentRuntime, KnowledgeBaseRetrievalResult } from "@aws-sdk/client-bedrock-agent-runtime";
import { AssessmentTemplate } from "./models/assessmentTemplate";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";


const CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0";

const bedrock = new BedrockRuntime();
const bedrockAgentRuntime = new BedrockAgentRuntime();
const parser = new XMLParser();
const builder = new XMLBuilder();

class Answer {
  answerText: string;
}

class Question {
  questionText: string;
  answers: Answer[];

}

class Response {
  questions: Question[]
}

class GeneratedQuestions {
  response: Response;
  correctAnswer: string;
  explanation: string;
}

class Lambda implements LambdaInterface {
  knowledgeBaseId: string;

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: APIGatewayProxyEventV2, lambdaContext: Context): Promise<string> {

    if (!event.body) {
      throw new Error("Unable to process the request");
    }
    const referenceDocuments = await ReferenceDocuments.fromJSON(event.body);
    this.knowledgeBaseId = referenceDocuments.knowledgeBaseId;

    // Extract topics from the Transcript document
    const topicsExtractionOutput = await this.getTopics(referenceDocuments);

    // Generate questions with given values
    const generatedQuestions = await this.generateInitialQuestions(topicsExtractionOutput, referenceDocuments.assessmentTemplate);

    // Query knowledge base for relevant documents
    // Refine questions/answers and include relevant documents
    const improvedQuestions = await this.improveQuestions(generatedQuestions);

    logger.info(improvedQuestions as any);
    // await this.storeQuestionnaire(improvedQuestions, )
    return "Success";
  }

  private async getTopics(referenceDocuments: ReferenceDocuments) {

    let prompt = `
Extract the key topics covered in the lecture. The lecture content is covered in the documents below.
Tell me the topics of the subject covered, do not include examples used to explain the concept.
For each topic, include a brief description of what was covered.
    `;

    for (let i = 0; i < referenceDocuments.documentsContent.length; i++) {
      const document = referenceDocuments.documentsContent[i];
      prompt += `Document ${i}:\n`;
      prompt += document;
    }
    logger.debug(prompt);
    let llmResponse = await callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    return llmResponse;
  }

  private async generateInitialQuestions(topicsExtractionOutput: string, assessmentTemplate: AssessmentTemplate) {

    let prompt = `
Craft a multiple-choice questionnaire (${assessmentTemplate.totalQuestions} questions)  for a university student based on the Provided Summarised Transcript.
Do not make references to the transcript or the lecture, the quiz should be clear and concise.
Do not ask questions on whether the topic was covered or not in the lecture.
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

Structure your response in this format and do not include any additional text, respond with the XML content only. The response must be valid XML following this format:
\`\`\`xml
<response>
    <questions>
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
        <explanation>[Explanation for Correctness]</explanation>
    </questions>
    <!-- all other questions below   -->
</response>
\`\`\`
    `;
    prompt += `Provided Summarised Transcript: \n ${topicsExtractionOutput}`;

    logger.debug(prompt);
    const llmResponse = await callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    return llmResponse;
  }

  private async getRelevantDocuments(question: Question) {
    //logger.info(question as any);

    const kbQuery = `Find the relevant documents for the following quiz question:\n${JSON.stringify(question)}`;
    logger.debug(`KB query: ${kbQuery}`);
    const retrievedDocs = await bedrockAgentRuntime.retrieve({
      knowledgeBaseId: this.knowledgeBaseId,
      retrievalQuery: {
        text: kbQuery.substring(0, 1000), // limit to 1000 chars
      },
    });
    const retrievalResults = retrievedDocs.retrievalResults;
    logger.debug(retrievedDocs as any);
    return retrievalResults;
  }


  private async improveQuestions(generatedQuestions: string) {

    logger.debug(generatedQuestions);
    const parsedQuestions: GeneratedQuestions = parser.parse(generatedQuestions);

    for (let i=0; i< parsedQuestions.response.questions.length;i++) {
      const question = parsedQuestions.response.questions[i];
      const relevantDocs = await this.getRelevantDocuments(question);
      const improvedQuestion = await this.improveQuestion(question, relevantDocs);
      parsedQuestions.response.questions[i] = improvedQuestion;
    }
    return Promise.resolve(parsedQuestions.response.questions);
  }

  private async improveQuestion(originalQuestion: Question, relevantDocs: KnowledgeBaseRetrievalResult[] | undefined) {
    if (!(relevantDocs && relevantDocs.length>0)){
      return originalQuestion;
    }

    logger.info(originalQuestion as any);
    const xmlQuestion = builder.build(originalQuestion);
    logger.info(xmlQuestion as any);
    const xmlDocs = builder.build(relevantDocs);
    logger.info(xmlDocs as any);
    let prompt = `
If relevant, use the content in the EXTRACTED_DOCUMENTS to improve the QUESTION.
Structure your response in the FORMAT.
Any reference to the EXTRACTED_DOCUMENTS, should include the uri of the document. 

QUESTION:
${xmlQuestion}

EXTRACTED_DOCUMENTS:
${xmlDocs}


Structure your response in this format and do not include any additional imput. The response must be valid XML following this FORMAT:
\`\`\`xml
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
    <explanation>[Explanation for Correctness]</explanation>
</question>
\`\`\`
    `;

    logger.debug(prompt);
    const llmResponse = await callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    const { question }:{question: Question} = parser.parse(llmResponse);
    return question;
  }
}


async function callLLM(modelId, prompt):Promise<string> {
  logger.debug(prompt);
  const body = JSON.stringify({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 4096,
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": prompt },
        ],
      },
    ],
  });
  const response = await bedrock.invokeModel({
    body: body,
    modelId: modelId,
    accept: "application/json",
    contentType: "application/json",
  });

  //TODO find out what Types we should expect
  const text = response.body.transformToString();
  //logger.info(text);
  const modelRes = JSON.parse(text);
  const contentElementElement = modelRes.content[0]["text"];

  return contentElementElement;
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
