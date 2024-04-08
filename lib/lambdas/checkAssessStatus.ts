import { Handler } from 'aws-lambda';
import { AssessStatus } from '../../ui/src/graphql/API';

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event, null, 1));
  return AssessStatus.Complete;
};
