// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const titlise = (input: string) => {
  return input
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

export const optionise = (value: string) => ({ value });

export function removeTypenames(data: any): any {
  if (Array.isArray(data)) {
    return data.map(removeTypenames);
  } else if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const key in data) {
      if (key !== '__typename') {
        result[key] = removeTypenames(data[key]);
      }
    }
    return result;
  } else {
    return data;
  }
}
