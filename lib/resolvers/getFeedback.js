import { createPgStatement, select, toJsonObject } from '@aws-appsync/utils/rds';

export function request(ctx) {
  const summaryid = ctx.source?.id || ctx.args.summaryid;
  const username = ctx.identity.sub;
  const statement = select({
    table: 'feedbacks',
    columns: '*',
    where: { summaryid: { eq: summaryid }, username: { eq: username } },
  });
  return createPgStatement(statement);
}

export function response(ctx) {
  return toJsonObject(ctx.result).pop().pop();
}
