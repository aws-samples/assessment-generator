// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { logger } from '../../../../rag-pipeline/lambdas/event-handler/utils/pt';
import { ReferenceDocuments } from '../models/referenceDocuments';
import { AssessmentTemplate } from '../models/assessmentTemplate';
import { GeneratedQuestions } from '../models/generatedQuestions';
import { BedrockAgentRuntime, KnowledgeBaseRetrievalResult } from '@aws-sdk/client-bedrock-agent-runtime';
import { BedrockRuntime } from '@aws-sdk/client-bedrock-runtime';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { MultiChoice, FreeText } from '../../../../../ui/src/graphql/API';
import { getInitialQuestionsPrompt, getRelevantDocumentsPrompt, getTopicsPrompt, improveQuestionPrompt } from './prompts';

const CLAUDE_3_HAIKU = 'anthropic.claude-3-haiku-20240307-v1:0';
const bedrock = new BedrockRuntime();
const bedrockAgentRuntime = new BedrockAgentRuntime();
const parser = new XMLParser();
const builder = new XMLBuilder();

export class GenAiService {
  private knowledgeBaseId: string;

  constructor(knowledgeBaseId: string) {
    this.knowledgeBaseId = knowledgeBaseId;
  }

  public async getTopics(referenceDocuments: ReferenceDocuments) {
    let prompt = getTopicsPrompt(referenceDocuments);
    logger.debug(prompt);
    let llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    return llmResponse;
  }

  public async generateInitialQuestions(topicsExtractionOutput: string, assessmentTemplate: AssessmentTemplate) {
    let prompt = getInitialQuestionsPrompt(assessmentTemplate, topicsExtractionOutput);
    logger.debug(prompt);
    const llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    return llmResponse;
  }

  public async getRelevantDocuments(question: MultiChoice | FreeText) {
    //logger.info(question as any);

    const kbQuery = getRelevantDocumentsPrompt(question);
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

  public async improveQuestions(generatedQuestions: string, assessmentTemplate: AssessmentTemplate) {
    logger.debug(generatedQuestions);
    const parsedQuestions: GeneratedQuestions = parser.parse(generatedQuestions);
    let improvedQuestions: MultiChoice | FreeText[] = [];

    for (let i = 0; i < parsedQuestions.response.questions.length; i++) {
      const question = parsedQuestions.response.questions[i];
      const relevantDocs = await this.getRelevantDocuments(question);
      const improvedQuestion = await this.improveQuestion(assessmentTemplate, question, relevantDocs);
      improvedQuestions.push(improvedQuestion);
    }
    return Promise.resolve(improvedQuestions);
  }

  private async callLLM(modelId, prompt): Promise<string> {
    logger.debug(prompt);
    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }],
        },
      ],
    });
    const response = await bedrock.invokeModel({
      body: body,
      modelId: modelId,
      accept: 'application/json',
      contentType: 'application/json',
    });

    //TODO find out what Types we should expect
    const text = response.body.transformToString();
    //logger.info(text);
    const modelRes = JSON.parse(text);
    const contentElementElement = modelRes.content[0]['text'];

    return contentElementElement;
  }

  private async improveQuestion(
    assessmentTemplate: AssessmentTemplate,
    originalQuestion: MultiChoice | FreeText,
    relevantDocs: KnowledgeBaseRetrievalResult[] | undefined
  ): Promise<MultiChoice | FreeText> {
    if (!(relevantDocs && relevantDocs.length > 0)) {
      return originalQuestion;
    }

    logger.info(originalQuestion as any);
    const xmlQuestion = builder.build(originalQuestion);
    logger.info(xmlQuestion as any);
    const xmlDocs = builder.build(relevantDocs);
    logger.info(xmlDocs as any);
    let prompt = improveQuestionPrompt(xmlQuestion, xmlDocs, assessmentTemplate);

    logger.debug(prompt);
    const llmResponse = await this.callLLM(CLAUDE_3_HAIKU, prompt);
    logger.debug(llmResponse);
    const { question }: { question: MultiChoice | FreeText } = parser.parse(llmResponse);
    return question;
  }
}
