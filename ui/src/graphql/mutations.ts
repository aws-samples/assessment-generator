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
export const createAssessTemplate = /* GraphQL */ `mutation CreateAssessTemplate($input: AssessTemplateInput) {
  createAssessTemplate(input: $input) {
    id
    name
    docLang
    assessType
    totalQuestions
    easyQuestions
    mediumQuestions
    hardQuestions
    createdAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAssessTemplateMutationVariables,
  APITypes.CreateAssessTemplateMutation
>;
export const upsertAssessment = /* GraphQL */ `mutation UpsertAssessment($input: AssessmentInput) {
  upsertAssessment(input: $input) {
    id
    name
    course
    lectureDate
    deadline
    updatedAt
    questions {
      title
      question
      answers
      correctAnswer
      __typename
    }
    published
    status
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpsertAssessmentMutationVariables,
  APITypes.UpsertAssessmentMutation
>;
export const upsertStudentAssessment = /* GraphQL */ `mutation UpsertStudentAssessment($input: StudentAssessmentInput) {
  upsertStudentAssessment(input: $input) {
    parentAssessId
    assessment {
      id
      name
      course
      lectureDate
      deadline
      updatedAt
      questions {
        title
        question
        answers
        correctAnswer
        __typename
      }
      published
      status
      __typename
    }
    answers
    completed
    score
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpsertStudentAssessmentMutationVariables,
  APITypes.UpsertStudentAssessmentMutation
>;
