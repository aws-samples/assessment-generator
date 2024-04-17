import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { logger } from "../../../../rag-pipeline/lambdas/event-handler/utils/pt";
import { Assessment, AssessStatus, GenerateAssessmentInput, QandA } from "../../../../../ui/src/graphql/API";

const ASSESSMENT_TABLE = process.env.ASSESSMENTS_TABLE;
const KB_TABLE = process.env.KB_TABLE;

export class DataService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient();
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async updateAssessment(improvedQuestions: QandA[], userId: string, assessmentId: string) {

    const currentAssessment = await this.getExistingAssessment(userId, assessmentId);
    currentAssessment.questions = improvedQuestions;
    currentAssessment.status = AssessStatus.CREATED;
    currentAssessment.published = false;
    currentAssessment.updatedAt = (new Date()).toISOString();

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

    const command = new PutCommand({
      TableName: ASSESSMENT_TABLE,
      Item: {
        name: assessmentInput.name,
        course: assessmentInput.courseId,
        lectureDate: assessmentInput.lectureDate,
        deadline: assessmentInput.deadline,
        userId: userId,
        id: assessmentId,
        status: AssessStatus.IN_PROGRESS,
        questions: [],
        published: false,
        updatedAt: (new Date()).toISOString(),
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

  async updateFailedAssessment(userId: string, assessmentId: string) {

    const command = new UpdateCommand({
      Key: {
        userId: userId,
        id: assessmentId,
      },
      UpdateExpression: "set #st=:status, updatedAt=:updatedAt",
      ExpressionAttributeNames:{
        "#st":"status"
      },
      ExpressionAttributeValues:{
        ":status": AssessStatus.FAILED,
        ":updatedAt": (new Date()).toISOString()
      },
      TableName: ASSESSMENT_TABLE,

    });
    logger.info(command as any);
    let ddbResponse = await this.docClient.send(command);
    logger.info(ddbResponse as any);
    return assessmentId;
  }
}