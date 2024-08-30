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
import { FreeText, MultiChoice } from '../../ui/src/graphql/API';
import { XMLParser } from 'fast-xml-parser';

const tracer = new Tracer();
const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
  logLevel: 'DEBUG',
});

const parser = new XMLParser();

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

    const multiChoiceAssessment = event.prev?.result.multiChoiceAssessment;
    const freeTextAssessment = event.prev?.result.freeTextAssessment;
    const answers = event.arguments.input.answers;

    if (multiChoiceAssessment) return gradeMultiChoice(multiChoiceAssessment, answers);
    if (freeTextAssessment) return gradeFreeText(freeTextAssessment, answers);
  }
}

async function gradeFreeText(freeTextAssessment: FreeText[], answers: any) {
  const report: any = {};
  let score = 0;
  for (let i = 0; i < freeTextAssessment.length; i++) {
    const assessment = freeTextAssessment[i];
    const answer = answers[i];
    const { rate, explanation } = await freeTextMarking(assessment, answer);
    report['' + i] = { rate, explanation };
    const totalWeights = assessment.rubric.reduce((acc, curr) => acc + curr.weight, 0);
    score = score + rate / totalWeights;
  }
  return { score: Math.round((score / freeTextAssessment.length) * 100), report };
}

function gradeMultiChoice(mulichoiceAssessment: MultiChoice[], answers: any) {
  let score = 0;
  for (let i = 0; i < mulichoiceAssessment.length; i++) {
    const assessment = mulichoiceAssessment[i];
    const answer = answers[i];
    if (assessment.correctAnswer == answer) score++;
  }
  return { score: Math.round((score / mulichoiceAssessment.length) * 100) };
}

async function freeTextMarking(assessment: FreeText, answer: any) {
  const response = await callLLM(`
    grade the answer provided for the question. Go through each rubric point and check if each point was addressed in the answer and for every point addressed add its weight to the total score and then place the total score in <rate> tag, and for every point that was not addressed in the answer don't add its weight and mention it in the explanation tag, also in <explanation> tag explain how you gave that score by explaining both what points were addressed and what points were not addressed in the answer, make sure that you highlight what points were not addressed and is missing from answer. Dont mention anything about weights, scores or the rubric items. If you cannot provide a meaningful assessment or score then just put score as 0 and put in explanation that the answer provided is not satisfactory.
    <question>${assessment.question}</question>
    <answer>${answer}</answer>
    <rubric>${JSON.stringify(assessment.rubric)}</rubric>
  `);
  const parsedResponse = parser.parse(response);
  const { rate, explanation } = parsedResponse;
  return { rate: +rate, explanation };
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
    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
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
