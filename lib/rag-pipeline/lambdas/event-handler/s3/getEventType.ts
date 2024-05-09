// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
 
import { DocumentEvent } from "./documentEvent";

/**
 * @param type the S3 event type.
 * @returns the corresponding event type in the context of
 * the cloud event specification.
 */
export const getEventType = (type: string): DocumentEvent => {
  if (type.startsWith('ObjectCreated')) {
    return (DocumentEvent.DOCUMENT_CREATED);
  } else if (type.startsWith('ObjectRemoved')) {
    return (DocumentEvent.DOCUMENT_DELETED);
  } else {
    throw new Error(`Unsupported S3 event type: ${type}`);
  }
};