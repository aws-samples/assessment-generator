// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
 
import { createContext } from 'react';
import { AuthUser } from 'aws-amplify/auth';

export interface UserProfile extends AuthUser {
  group: string;
  email: string;
  name: string;
}

export const UserProfileContext = createContext<UserProfile | undefined>(undefined);
