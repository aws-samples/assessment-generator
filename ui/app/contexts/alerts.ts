import { createContext } from 'react';
import { FlashbarProps } from '@cloudscape-design/components';

export const DispatchAlertContext = createContext<(newAlert: FlashbarProps.MessageDefinition) => void>(() => {});
