import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const userId = ctx.identity.sub;
  return ddb.put({ key: { userId, id: util.autoUlid() }, item: { ...ctx.args.input, createdAt: util.time.nowISO8601() } });
}

export const response = (ctx) => ctx.result;
