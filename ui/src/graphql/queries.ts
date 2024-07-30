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
      }
      freeTextAssessment {
        title
        question
        rubric {
          weight
          point
        }
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
export const listAssessments = /* GraphQL */ `
  query ListAssessments {
    listAssessments {
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
      }
      freeTextAssessment {
        title
        question
        rubric {
          weight
          point
        }
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
export const listAssessTemplates = /* GraphQL */ `
  query ListAssessTemplates {
    listAssessTemplates {
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
        }
        freeTextAssessment {
          title
          question
          rubric {
            weight
            point
          }
        }
        published
        status
        course {
          id
          name
          description
        }
      }
      answers
      completed
      score
      report
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
        }
        freeTextAssessment {
          title
          question
          rubric {
            weight
            point
          }
        }
        published
        status
        course {
          id
          name
          description
        }
      }
      answers
      completed
      score
      report
      updatedAt
    }
  }
`;
export const listMyStudentAssessments = /* GraphQL */ `
  query ListMyStudentAssessments($studentId: ID!) {
    listMyStudentAssessments(studentId: $studentId) {
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
        }
        freeTextAssessment {
          title
          question
          rubric {
            weight
            point
          }
        }
        published
        status
        course {
          id
          name
          description
        }
      }
      answers
      completed
      score
      report
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
