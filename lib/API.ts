/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateSettingsInput = {
  uiLang?: string | null,
  docLang?: string | null,
  assessType?: string | null,
};

export type Settings = {
  __typename: "Settings",
  username: string,
  uiLang?: string | null,
  docLang?: string | null,
  assessType?: string | null,
};

export type CreateSettingsInputMutationVariables = {
  input: CreateSettingsInput,
};

export type CreateSettingsInputMutation = {
  CreateSettingsInput?:  {
    __typename: "Settings",
    username: string,
    uiLang?: string | null,
    docLang?: string | null,
    assessType?: string | null,
  } | null,
};

export type GetSettingsQueryVariables = {
  username: string,
};

export type GetSettingsQuery = {
  getSettings?:  {
    __typename: "Settings",
    username: string,
    uiLang?: string | null,
    docLang?: string | null,
    assessType?: string | null,
  } | null,
};
