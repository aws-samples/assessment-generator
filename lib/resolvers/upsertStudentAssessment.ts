// import { Context } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const userId = ctx.identity.sub;
  const { parentAssessId, ...args } = ctx.args.input;
  return ddb.put({ key: { userId, parentAssessId }, item: { ...args, createdAt: util.time.nowISO8601() } });
}

export const response = (ctx) => ctx.result;
