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
export const upsertCourse = /* GraphQL */ `
  mutation UpsertCourse($input: CourseInput) {
    upsertCourse(input: $input) {
      id
      name
      description
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
      courseId
      lectureDate
      deadline
      updatedAt
      questions {
        title
        question
        answers
        correctAnswer
        explanation
      }
      published
      status
      course {
        id
        name
        description
      }
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
        courseId
        lectureDate
        deadline
        updatedAt
        questions {
          title
          question
          answers
          correctAnswer
          explanation
        }
        published
        status
        course {
          id
          name
          description
        }
      }
      chosenAnswers
      completed
      score
      updatedAt
    }
  }
`;
