import { createContext } from 'react';
import { AuthUser } from 'aws-amplify/auth';

export interface UserProfile extends AuthUser {
  group: string;
  email: string;
  name: string;
}

export const UserProfileContext = createContext<UserProfile | undefined>(undefined);
