import { createContext } from 'react';

export const GetProfileContext = createContext<(profile: any) => void>(() => {});
