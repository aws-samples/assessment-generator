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
export const listCourses = /* GraphQL */ `
  query ListCourses {
    listCourses {
      id
      name
      description
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
      }
      published
      status
    }
  }
`;
export const listAssessments = /* GraphQL */ `
  query ListAssessments {
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
      }
      published
      status
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
        }
        published
        status
      }
      answers
      completed
      score
      updatedAt
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
        }
        published
        status
      }
      answers
      completed
      score
      updatedAt
    }
  }
`;
export const publishAssessment = /* GraphQL */ `
  query PublishAssessment($assessmentId: ID!) {
    publishAssessment(assessmentId: $assessmentId)
  }
`;
export const createKnowledgeBase = /* GraphQL */ `
  query CreateKnowledgeBase($courseId: ID, $locations: [String]) {
    createKnowledgeBase(courseId: $courseId, locations: $locations)
  }
`;
export const generateAssessment = /* GraphQL */ `
  query GenerateAssessment($input: GenerateAssessmentInput) {
    generateAssessment(input: $input)
  }
`;
export const checkAssessStatus = /* GraphQL */ `
  query CheckAssessStatus($id: ID!) {
    checkAssessStatus(id: $id)
  }
`;
