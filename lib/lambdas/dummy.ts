import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event, null, 1));
};
