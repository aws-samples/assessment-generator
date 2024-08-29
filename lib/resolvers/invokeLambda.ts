// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: ctx,
  };
}

export function response(ctx) {
  return ctx.result;
}
