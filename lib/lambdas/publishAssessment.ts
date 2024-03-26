import { DynamoDBClient, GetItemCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { Handler } from 'aws-lambda';

const region = process.env.region!;
const classesTable = process.env.classesTable!;
const studentAssessmentsTable = process.env.studentAssessmentsTable!;

const dynamoClient = new DynamoDBClient({ region });

export const handler: Handler = async (event) => {
  const { assessmentId, classId } = event.ctx.arguments;

  const sourceTableParams = {
    TableName: classesTable,
    Key: { id: { S: classId } },
  };

  const classItem: any = (await dynamoClient.send(new GetItemCommand(sourceTableParams))).Item;

  const targetTableParams = {
    RequestItems: {
      [studentAssessmentsTable]: classItem.students.L.map(({ S: student }: any) => ({
        PutRequest: {
          Item: {
            userId: {
              S: student,
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
  };

  await dynamoClient.send(new BatchWriteItemCommand(targetTableParams));
};
