/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSettings = /* GraphQL */ `
  query GetSettings {
    getSettings {
      uiLang
      docLang
      assessType
    }
  }
`;
export const listCoarses = /* GraphQL */ `
  query ListCoarses {
    listCoarses {
      id
      name
      description
    }
  }
`;
export const listClasses = /* GraphQL */ `
  query ListClasses {
    listClasses {
      id
      name
      students
    }
  }
`;
export const listStudents = /* GraphQL */ `
  query ListStudents {
    listStudents {
      id
      firstName
      lastName
    }
  }
`;
export const getAssessment = /* GraphQL */ `
  query GetAssessment($id: ID!) {
    getAssessment(id: $id) {
      id
      name
      coarse
      classId
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
export const listAssessments = /* GraphQL */ `
  query ListAssessments {
    listAssessments {
      id
      name
      coarse
      classId
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
export const getStudentAssessment = /* GraphQL */ `
  query GetStudentAssessment($parentAssessId: ID!) {
    getStudentAssessment(parentAssessId: $parentAssessId) {
      parentAssessId
      assessment {
        id
        name
        coarse
        classId
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
      status
      score
      createdAt
    }
  }
`;
export const listStudentAssessments = /* GraphQL */ `
  query ListStudentAssessments {
    listStudentAssessments {
      parentAssessId
      assessment {
        id
        name
        coarse
        classId
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
      status
      score
      createdAt
    }
  }
`;
export const publishAssessment = /* GraphQL */ `
  query PublishAssessment($assessmentId: ID!, $class: String!) {
    publishAssessment(assessmentId: $assessmentId, class: $class)
  }
`;
