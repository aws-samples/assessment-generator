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
export const listCourses = /* GraphQL */ `query ListCourses {
  listCourses {
    id
    name
    description
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCoursesQueryVariables,
  APITypes.ListCoursesQuery
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
    course
    lectureDate
    deadline
    updatedAt
    questions {
      title
      question
      answers
      correctAnswer
      explanation
      __typename
    }
    published
    status
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
    course
    lectureDate
    deadline
    updatedAt
    questions {
      title
      question
      answers
      correctAnswer
      explanation
      __typename
    }
    published
    status
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssessmentsQueryVariables,
  APITypes.ListAssessmentsQuery
>;
export const listAssessTemplates = /* GraphQL */ `query ListAssessTemplates {
  listAssessTemplates {
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
` as GeneratedQuery<
  APITypes.ListAssessTemplatesQueryVariables,
  APITypes.ListAssessTemplatesQuery
>;
export const getStudentAssessment = /* GraphQL */ `query GetStudentAssessment($parentAssessId: ID!) {
  getStudentAssessment(parentAssessId: $parentAssessId) {
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
        explanation
        __typename
      }
      published
      status
      __typename
    }
    chosenAnswers
    completed
    score
    updatedAt
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
      course
      lectureDate
      deadline
      updatedAt
      questions {
        title
        question
        answers
        correctAnswer
        explanation
        __typename
      }
      published
      status
      __typename
    }
    chosenAnswers
    completed
    score
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStudentAssessmentsQueryVariables,
  APITypes.ListStudentAssessmentsQuery
>;
export const publishAssessment = /* GraphQL */ `query PublishAssessment($assessmentId: ID!) {
  publishAssessment(assessmentId: $assessmentId)
}
` as GeneratedQuery<
  APITypes.PublishAssessmentQueryVariables,
  APITypes.PublishAssessmentQuery
>;
export const createKnowledgeBase = /* GraphQL */ `query CreateKnowledgeBase($courseId: ID, $locations: [String]) {
  createKnowledgeBase(courseId: $courseId, locations: $locations)
}
` as GeneratedQuery<
  APITypes.CreateKnowledgeBaseQueryVariables,
  APITypes.CreateKnowledgeBaseQuery
>;
export const generateAssessment = /* GraphQL */ `query GenerateAssessment($input: GenerateAssessmentInput) {
  generateAssessment(input: $input)
}
` as GeneratedQuery<
  APITypes.GenerateAssessmentQueryVariables,
  APITypes.GenerateAssessmentQuery
>;
