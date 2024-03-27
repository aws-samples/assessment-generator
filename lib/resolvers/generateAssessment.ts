import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: { ctx },
  };
}

export function response(ctx) {
  return ctx.result;
}
