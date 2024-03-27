import { Question } from "../models/question";
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { logger } from "../../../../rag-pipeline/lambdas/event-handler/utils/pt";



const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const ASSESSMENT_TABLE = process.env.ASSESSMENT_TABLE || "GenAssessStack-DataStackNestedStackDataStackNestedStackResource8D986F6F-1B8VYNK2IZULF-AssessmentsTable6996196E-4JI1FPXW24NX";
export class DataService {

  async storeAssessment(improvedQuestions: Question[], userId: string) {
    //Create UUID
    let assessmentId = uuidv4();

    console.log(JSON.stringify(improvedQuestions));
    console.log(ASSESSMENT_TABLE);
    const command = new PutCommand({
      TableName: ASSESSMENT_TABLE,
      Item: {
        /* TODO Data to add
        "classId": "111",
        "course": "Maths",
        "deadline": "2011-10-05T14:48:00.000Z",
        "lectureDate": "2011-10-05T14:48:00.000Z",
        "name": "Week 1",*/
        userId,
        id: assessmentId,
        questions: improvedQuestions,
        published: false,
        updatedAt: (new Date()).toISOString(),
      },
    });

    logger.info(command as any);
    let ddbResponse = await docClient.send(command);
    logger.info(ddbResponse as any);
    return assessmentId;
  }
}