import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  console.log('Received event {}', JSON.stringify(event, null, 3));
};
