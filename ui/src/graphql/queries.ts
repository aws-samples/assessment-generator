/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getSettings = /* GraphQL */ `query GetSettings {
  getSettings {
    uiLang
    docLang
    assessType
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSettingsQueryVariables,
  APITypes.GetSettingsQuery
>;
export const listCoarses = /* GraphQL */ `query ListCoarses {
  listCoarses {
    id
    name
    description
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCoarsesQueryVariables,
  APITypes.ListCoarsesQuery
>;
export const listClasses = /* GraphQL */ `query ListClasses {
  listClasses {
    id
    name
    students
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListClassesQueryVariables,
  APITypes.ListClassesQuery
>;
export const listStudents = /* GraphQL */ `query ListStudents {
  listStudents {
    id
    firstName
    lastName
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStudentsQueryVariables,
  APITypes.ListStudentsQuery
>;
export const getAssessment = /* GraphQL */ `query GetAssessment($id: ID!) {
  getAssessment(id: $id) {
    id
    name
    coarse
    lecture
    lectureDate
    version
    deadline
    updatedAt
    questions {
      title
      question
      answers
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAssessmentQueryVariables,
  APITypes.GetAssessmentQuery
>;
export const listAssessments = /* GraphQL */ `query ListAssessments {
  listAssessments {
    id
    name
    coarse
    lecture
    lectureDate
    version
    deadline
    updatedAt
    questions {
      title
      question
      answers
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssessmentsQueryVariables,
  APITypes.ListAssessmentsQuery
>;
export const getStudentAssessment = /* GraphQL */ `query GetStudentAssessment($parentAssessId: ID!) {
  getStudentAssessment(parentAssessId: $parentAssessId) {
    parentAssessId
    assessment {
      id
      name
      coarse
      lecture
      lectureDate
      version
      deadline
      updatedAt
      __typename
    }
    answers
    status
    createdAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetStudentAssessmentQueryVariables,
  APITypes.GetStudentAssessmentQuery
>;
export const listStudentAssessments = /* GraphQL */ `query ListStudentAssessments {
  listStudentAssessments {
    parentAssessId
    assessment {
      id
      name
      coarse
      lecture
      lectureDate
      version
      deadline
      updatedAt
      __typename
    }
    answers
    status
    createdAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStudentAssessmentsQueryVariables,
  APITypes.ListStudentAssessmentsQuery
>;
