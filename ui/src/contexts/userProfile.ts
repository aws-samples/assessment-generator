import { createContext } from 'react';
import { AuthUser } from 'aws-amplify/auth';

export interface UserProfile extends AuthUser {
  group?: string;
}

export const UserProfileContext = createContext<UserProfile | undefined>(undefined);
