// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DynamoDBClient, BatchWriteItemCommand, UpdateItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Handler } from 'aws-lambda';
import { AssessStatus } from '../../ui/src/graphql/API';

const region = process.env.region!;
const studentsTable = process.env.studentsTable!;
const assessmentsTable = process.env.assessmentsTable!;
const studentAssessmentsTable = process.env.studentAssessmentsTable!;

const dynamoClient = new DynamoDBClient({ region });

export const handler: Handler = async (event) => {
  const { assessmentId } = event.ctx.arguments;
  const userId = event.ctx.identity.sub;

  const { Items: students }: any = await dynamoClient.send(new ScanCommand({ TableName: studentsTable }));
  if (!students || students.length === 0) return;

  // noinspection TypeScriptValidateTypes
  await dynamoClient.send(
    new BatchWriteItemCommand({
      RequestItems: {
        [studentAssessmentsTable]: students.map(({ id }: any) => ({
          PutRequest: {
            Item: {
              userId: {
                S: id.S,
              },
              parentAssessId: {
                S: assessmentId,
              },
              answers: {
                L: [],
              },
              updatedAt: {
                S: new Date().toISOString(),
              },
            },
          },
        })),
      },
    })
  );

  // noinspection TypeScriptValidateTypes
  await dynamoClient.send(
    new UpdateItemCommand({
      TableName: assessmentsTable,
      Key: { id: { S: assessmentId }, userId: { S: userId } },
      UpdateExpression: 'set published = :published, #st = :status',
      ExpressionAttributeValues: {
        ':published': { BOOL: 'true' },
        ':status': { S: AssessStatus.PUBLISHED },
      },
      ExpressionAttributeNames: {
        '#st': 'status',
      },
      ReturnValues: 'ALL_NEW',
    } as any)
  );
};
