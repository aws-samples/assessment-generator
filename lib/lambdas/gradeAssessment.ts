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
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { BedrockRuntime } from '@aws-sdk/client-bedrock-runtime';

const tracer = new Tracer();
const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
  logLevel: 'DEBUG',
});

const bedrock = new BedrockRuntime();

class Lambda implements LambdaInterface {
  /**
   * @param event the received AppSyncResolver event
   * @param context the Context provided by Lambda
   */
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  async handler(event: AppSyncResolverEvent<any>, context: Context): Promise<any> {
    logger.info('Received event:', event as any);

    const questions = event.prev?.result.questions;
    const answers = event.arguments.input.answers;
    const analyses: any = {};

    let score = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];
      if (question.answerChoices) {
        if (question.correctAnswer == answer) score++;
      } else {
        const { rate, analysis } = await freeTextMarking(question, answer);
        analyses['' + i] = { rate, analysis };
        if (rate >= 50) score++;
      }
    }

    return { analyses, score: Math.round((score / questions.length) * 100) };
  }
}

async function freeTextMarking(question: any, answer: any) {
  const response = await callLLM(`
      Give a 0-100 rate to the answer provided for the question in <rate> tag, and use the explanation to help judge the score, also give an explanation on why you gave that score in <analysis> tag. But first make sure that the answer does not contradict the explanation or the best answer, otherwise the score should be fail. And in the analysis DON'T mention or reference the explanation. And in the analysis DON'T mention or reference the best answer
      <question>${question.question}</question>
      <answer>${answer}</answer>
      <explanation>${question.explanation}</explanation>
    `);
  const [, rate] = response.match(/<rate>(.*?)<\/rate>/);
  const [, analysis] = response.match(/<analysis>(.*?)<\/analysis>/);
  return { rate: +rate, analysis };
}

async function callLLM(prompt: string) {
  logger.info(prompt);
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
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    accept: 'application/json',
    contentType: 'application/json',
  });

  const text = response.body.transformToString();
  logger.info(text);
  const modelRes = JSON.parse(text);
  const contentElementElement = modelRes.content[0]['text'];

  return contentElementElement;
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const handler = handlerClass.handler.bind(handlerClass);
