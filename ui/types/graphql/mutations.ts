/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createFeedback = /* GraphQL */ `mutation CreateFeedback($input: CreateFeedbackInput!) {
  createFeedback(input: $input) {
    summaryid
    feedback
    timestamp
    summary {
      id
      name
      contents
      timestamp
      __typename
    }
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateFeedbackMutationVariables,
  APITypes.CreateFeedbackMutation
>;
