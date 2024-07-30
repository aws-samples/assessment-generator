// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const id = ctx.source?.parentAssessId || ctx.args.input.parentAssessId;
  return {
    index: 'id-only',
    operation: 'Query',
    query: {
      expression: 'id = :id',
      expressionValues: util.dynamodb.toMapValues({ ':id': id }),
    },
  };
}

export const response = (ctx) => {
  return ctx.result.items.pop();
};
