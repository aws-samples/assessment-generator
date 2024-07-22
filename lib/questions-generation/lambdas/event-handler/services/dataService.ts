// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from '../../../../rag-pipeline/lambdas/event-handler/utils/pt';
import { Assessment, AssessStatus, GenerateAssessmentInput, MultiChoice, FreeText, AssessType } from '../../../../../ui/src/graphql/API';
import { AssessmentTemplate } from '../models/assessmentTemplate';

const ASSESSMENT_TABLE = process.env.ASSESSMENTS_TABLE;
const KB_TABLE = process.env.KB_TABLE;
const ASSESS_TEMPLATE_TABLE = process.env.ASSESS_TEMPLATE_TABLE;

export class DataService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient();
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async updateAssessment(improvedQuestions: MultiChoice[] | FreeText[], userId: string, assessmentId: string) {
    const currentAssessment = await this.getExistingAssessment(userId, assessmentId);
    currentAssessment[currentAssessment.assessType] = improvedQuestions;
    currentAssessment.status = AssessStatus.CREATED;
    currentAssessment.published = false;
    currentAssessment.updatedAt = new Date().toISOString();

    const command = new PutCommand({
      TableName: ASSESSMENT_TABLE,
      Item: currentAssessment,
    });

    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);
    logger.info(ddbResponse as any);
    return assessmentId;
  }

  async storeEmptyAssessment(assessmentInput: GenerateAssessmentInput, userId: string) {
    //Create UUID if it is not passed in
    const assessmentId = uuidv4();
    logger.info(`Storing empty assessment assessmentId: ${assessmentId}`);

    const assessType = assessmentInput.assessTemplateId
      ? (await this.getExistingAssessmentTemplate(assessmentInput.assessTemplateId, userId)).assessType
      : AssessType.multiChoiceAssessment;

    const command = new PutCommand({
      TableName: ASSESSMENT_TABLE,
      Item: {
        name: assessmentInput.name,
        courseId: assessmentInput.courseId,
        lectureDate: assessmentInput.lectureDate,
        deadline: assessmentInput.deadline,
        userId: userId,
        id: assessmentId,
        assessType,
        status: AssessStatus.IN_PROGRESS,
        published: false,
        updatedAt: new Date().toISOString(),
      },
    });

    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);
    logger.info(ddbResponse as any);
    return assessmentId;
  }

  async getExistingAssessment(userId: string, assessmentId: string): Promise<Assessment> {
    // noinspection TypeScriptValidateTypes
    const command = new GetCommand({
      Key: {
        userId: userId,
        id: assessmentId,
      },
      TableName: ASSESSMENT_TABLE,
    });
    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);

    logger.info(ddbResponse as any);
    return ddbResponse.Item as Assessment;
  }

  async getExistingKnowledgeBase(courseId: string, userId: string) {
    // noinspection TypeScriptValidateTypes
    const command = new GetCommand({
      Key: {
        userId: userId,
        courseId: courseId,
      },
      TableName: KB_TABLE,
    });
    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);

    logger.info(ddbResponse as any);
    return ddbResponse.Item;
  }

  async getExistingAssessmentTemplate(assessTemplateId: string, userId: string): Promise<AssessmentTemplate> {
    // noinspection TypeScriptValidateTypes
    const command = new GetCommand({
      Key: {
        userId: userId,
        id: assessTemplateId,
      },
      TableName: ASSESS_TEMPLATE_TABLE,
    });
    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);

    logger.info(ddbResponse as any);
    return ddbResponse.Item as AssessmentTemplate;
  }

  async updateFailedAssessment(userId: string, assessmentId: string) {
    const command = new UpdateCommand({
      Key: {
        userId: userId,
        id: assessmentId,
      },
      UpdateExpression: 'set #st=:status, updatedAt=:updatedAt',
      ExpressionAttributeNames: {
        '#st': 'status',
      },
      ExpressionAttributeValues: {
        ':status': AssessStatus.FAILED,
        ':updatedAt': new Date().toISOString(),
      },
      TableName: ASSESSMENT_TABLE,
    });
    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);
    logger.info(ddbResponse as any);
    return assessmentId;
  }
}
