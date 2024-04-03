import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Query',
    query: {
      expression: 'userId = :userId',
      expressionValues: util.dynamodb.toMapValues({ ':userId': ctx.identity.sub }),
    },
  };
}

export const response = (ctx) => {
  return ctx.result.items;
};
