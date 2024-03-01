import { createPgStatement, toJsonObject } from '@aws-appsync/utils/rds';

export function request(ctx) {
  const { id } = ctx.source;
  const statement = `SELECT COUNT(*), feedback FROM feedbacks WHERE summaryid = '${id}' GROUP BY feedback;`;
  return createPgStatement(statement);
}

export function response(ctx) {
  return toJsonObject(ctx.result).pop();
}
