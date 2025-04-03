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
export const upsertCourse = /* GraphQL */ `mutation UpsertCourse($input: CourseInput) {
  upsertCourse(input: $input) {
    id
    name
    description
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpsertCourseMutationVariables,
  APITypes.UpsertCourseMutation
>;
export const createAssessTemplate = /* GraphQL */ `mutation CreateAssessTemplate($input: AssessTemplateInput) {
  createAssessTemplate(input: $input) {
    id
    name
    docLang
    assessType
    taxonomy
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
    courseId
    lectureDate
    deadline
    updatedAt
    assessType
    multiChoiceAssessment {
      title
      question
      answerChoices
      correctAnswer
      explanation
      __typename
    }
    freeTextAssessment {
      title
      question
      rubric {
        weight
        point
        __typename
      }
      __typename
    }
    published
    status
    course {
      id
      name
      description
      __typename
    }
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
      courseId
      lectureDate
      deadline
      updatedAt
      assessType
      multiChoiceAssessment {
        title
        question
        answerChoices
        correctAnswer
        explanation
        __typename
      }
      freeTextAssessment {
        title
        question
        rubric {
          weight
          point
          __typename
        }
        __typename
      }
      published
      status
      course {
        id
        name
        description
        __typename
      }
      __typename
    }
    answers
    completed
    score
    report
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpsertStudentAssessmentMutationVariables,
  APITypes.UpsertStudentAssessmentMutation
>;
export const gradeStudentAssessment = /* GraphQL */ `mutation GradeStudentAssessment($input: StudentAssessmentInput) {
  gradeStudentAssessment(input: $input) {
    parentAssessId
    assessment {
      id
      name
      courseId
      lectureDate
      deadline
      updatedAt
      assessType
      multiChoiceAssessment {
        title
        question
        answerChoices
        correctAnswer
        explanation
        __typename
      }
      freeTextAssessment {
        title
        question
        rubric {
          weight
          point
          __typename
        }
        __typename
      }
      published
      status
      course {
        id
        name
        description
        __typename
      }
      __typename
    }
    answers
    completed
    score
    report
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.GradeStudentAssessmentMutationVariables,
  APITypes.GradeStudentAssessmentMutation
>;
export const deleteAssessments = /* GraphQL */ `mutation DeleteAssessments($id: ID) {
  deleteAssessments(id: $id)
}
` as GeneratedMutation<
  APITypes.DeleteAssessmentsMutationVariables,
  APITypes.DeleteAssessmentsMutation
>;
export const createKnowledgeBase = /* GraphQL */ `mutation CreateKnowledgeBase($courseId: ID, $locations: [String]) {
  createKnowledgeBase(courseId: $courseId, locations: $locations) {
    ingestionJobId
    knowledgeBaseId
    dataSourceId
    status
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateKnowledgeBaseMutationVariables,
  APITypes.CreateKnowledgeBaseMutation
>;
