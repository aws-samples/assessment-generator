// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
// import { Context } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const userId = ctx.identity.sub;
  const score = ctx.prev?.result?.score;
  const report = ctx.prev?.result?.report;
  const { parentAssessId, ...args } = ctx.args.input;

  const item = { ...args, updatedAt: util.time.nowISO8601() };

  if (score) {
    item.score = score;
    item.completed = true;
  }

  if (report) {
    item.report = report;
  }

  return ddb.put({ key: { userId, parentAssessId }, item });
}

export const response = (ctx) => ctx.result;
