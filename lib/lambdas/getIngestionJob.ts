import { BedrockAgentClient, GetIngestionJobCommand } from '@aws-sdk/client-bedrock-agent'; // ES Modules import
// const { BedrockAgentClient, GetIngestionJobCommand } = require("@aws-sdk/client-bedrock-agent"); // CommonJS import

const client = new BedrockAgentClient();

export const handler = async (event) => {
  const command = new GetIngestionJobCommand(event.arguments.input);
  const response = await client.send(command);
  return response.ingestionJob;
};
