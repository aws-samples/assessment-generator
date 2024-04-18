import { Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { LambdaInterface } from "@aws-lambda-powertools/commons/lib/esm/types";
import { logger, tracer } from "../rag-pipeline/lambdas/event-handler/utils/pt";
import { getParameter } from '@aws-lambda-powertools/parameters/ssm';
import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";


const client = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(client);


const cognitoIdentityProviderClient = new CognitoIdentityProviderClient();

class Lambda implements LambdaInterface {
  private userPoolId: string;

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: PostConfirmationTriggerEvent, lambdaContext: Context) {
    this.userPoolId = event.userPoolId;
    const { userAttributes } = event.request;
    const userRole = userAttributes['custom:role'];
    switch (userRole) {
      case "teachers":
        await this.registerTeacher(userAttributes);
        break;
      case "students":
        await this.registerStudent(userAttributes);
        break;
      default:
        throw new Error("Invalid role selected");
    }

    return event;
  }

  async registerStudent(userAttributes) {
    const STUDENTS_TABLE = await getParameter(process.env.STUDENTS_TABLE_PARAM);
    const createdAt = new Date().toJSON();
    await this.assignToGroup(userAttributes["sub"], "students");

    const data = {
      id: userAttributes['sub'],
      name: userAttributes['name'],
      createdAt,
    };

    const command = new PutCommand({
      TableName: STUDENTS_TABLE,
      Item: data,
    });

    await documentClient.send(command);
  }

  async registerTeacher(userAttributes) {
    await this.assignToGroup(userAttributes["sub"], "teachers");
  }

  async assignToGroup(sub, group) {
    let request = new AdminAddUserToGroupCommand({
      UserPoolId: this.userPoolId,
      Username: sub,
      GroupName: group,
    });
    const response = await cognitoIdentityProviderClient.send<AdminAddUserToGroupCommand>(request);
    logger.info(response as any);
    return response;
  }
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const postConfirmation = handlerClass.handler.bind(handlerClass);
