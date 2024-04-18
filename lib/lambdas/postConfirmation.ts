import { Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { LambdaInterface } from "@aws-lambda-powertools/commons/lib/esm/types";
import { logger, tracer } from "../rag-pipeline/lambdas/event-handler/utils/pt";
import { getParameter } from '@aws-lambda-powertools/parameters/ssm';


const client = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(client);

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handler(event: PostConfirmationTriggerEvent, lambdaContext: Context): Promise<PostConfirmationTriggerEvent> {

    const STUDENTS_TABLE = await getParameter(process.env.STUDENTS_TABLE_PARAM);
    const createdAt = new Date().toJSON();
    const { userAttributes } = event.request;

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

    return event;
  }
}

// The Lambda handler class.
const handlerClass = new Lambda();

// The handler function.
export const postConfirmation = handlerClass.handler.bind(handlerClass);
