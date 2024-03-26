// import { Context } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const userId = ctx.identity.sub;
  return ddb.get({ key: { userId, parentAssessId: ctx.args.parentAssessId } });
}

export const response = (ctx) => ctx.result;
