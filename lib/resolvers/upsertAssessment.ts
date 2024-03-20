// import { Context } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const userId = ctx.identity.sub;
  const { id, ...args } = ctx.args.input;
  return ddb.put({ key: { userId, id: id || util.autoUlid() }, item: { ...args, updatedAt: util.time.nowISO8601() } });
}

export const response = (ctx) => ctx.result;
