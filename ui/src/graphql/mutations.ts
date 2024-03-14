/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const upsertSettings = /* GraphQL */ `mutation UpsertSettings($input: UpsertSettingsInput) {
  upsertSettings(input: $input) {
    uiLang
    docLang
    assessType
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpsertSettingsMutationVariables,
  APITypes.UpsertSettingsMutation
>;
