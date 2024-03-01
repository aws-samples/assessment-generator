import { createPgStatement, select, toJsonObject } from '@aws-appsync/utils/rds';

export function request(ctx) {
  const statement = select({
    table: 'feedbacks',
    columns: '*',
  });
  return createPgStatement(statement);
}

export function response(ctx) {
  return toJsonObject(ctx.result).pop();
}
