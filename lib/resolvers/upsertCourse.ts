// import { Context } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { id, ...item } = ctx.args.input;
  return ddb.put({ key: { id: id || util.autoId() }, item });
}

export const response = (ctx) => ctx.result;
