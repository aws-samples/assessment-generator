// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
 
// import { Context } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  return ddb.get({ key: { id: ctx.source.courseId } });
}

export const response = (ctx) => ctx.result;
