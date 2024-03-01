import { createPgStatement, insert, toJsonObject } from '@aws-appsync/utils/rds';

export function request(ctx) {
  const username = ctx.identity.sub;
  const statement = insert({
    table: 'feedbacks',
    values: { ...ctx.args.input, username },
    returning: '*',
  });
  return createPgStatement(statement);
}

export function response(ctx) {
  return toJsonObject(ctx.result).pop().pop();
}
