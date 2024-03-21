import { createContext } from 'react';
import { FlashbarProps } from '@cloudscape-design/components';

export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
}

export const DispatchAlertContext = createContext<(newAlert: FlashbarProps.MessageDefinition) => void>(() => {});
