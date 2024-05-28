// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
 
import { createContext } from 'react';
import { FlashbarProps } from '@cloudscape-design/components';

export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
}

export const DispatchAlertContext = createContext<(newAlert: FlashbarProps.MessageDefinition) => void>(() => {});
