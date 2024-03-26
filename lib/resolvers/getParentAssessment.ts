import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    index: 'id-only',
    operation: 'Query',
    query: {
      expression: 'id = :id',
      expressionValues: util.dynamodb.toMapValues({ ':id': ctx.source.parentAssessId }),
    },
  };
}

export const response = (ctx) => {
  console.log(ctx);
  return ctx.result.items.pop();
};
