/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const upsertSettings = /* GraphQL */ `
  mutation UpsertSettings($input: UpsertSettingsInput) {
    upsertSettings(input: $input) {
      uiLang
      docLang
      assessType
    }
  }
`;
export const createAssessTemplate = /* GraphQL */ `
  mutation CreateAssessTemplate($input: AssessTemplateInput) {
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
    }
  }
`;
export const upsertAssessment = /* GraphQL */ `
  mutation UpsertAssessment($input: AssessmentInput) {
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
      }
      published
    }
  }
`;
export const upsertStudentAssessment = /* GraphQL */ `
  mutation UpsertStudentAssessment($input: StudentAssessmentInput) {
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
        }
        published
      }
      answers
      completed
      score
      updatedAt
    }
  }
`;
