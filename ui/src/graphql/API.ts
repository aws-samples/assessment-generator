/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type UpsertSettingsInput = {
  uiLang: Lang,
  docLang: Lang,
  assessType: AssessType,
};

export enum Lang {
  EN = "EN",
  FR = "FR",
  ES = "ES",
}


export enum AssessType {
  multiChoiceAssessment = "multiChoiceAssessment",
  freeTextAssessment = "freeTextAssessment",
}


export type Settings = {
  __typename: "Settings",
  uiLang?: Lang | null,
  docLang?: Lang | null,
  assessType?: AssessType | null,
};

export type CourseInput = {
  id?: string | null,
  name: string,
  description: string,
};

export type Course = {
  __typename: "Course",
  id: string,
  name?: string | null,
  description?: string | null,
};

export type AssessTemplateInput = {
  name?: string | null,
  docLang: Lang,
  assessType: AssessType,
  taxonomy: Taxonomy,
  totalQuestions: number,
  easyQuestions: number,
  mediumQuestions: number,
  hardQuestions: number,
};

export enum Taxonomy {
  Knowledge = "Knowledge",
  Comprehension = "Comprehension",
  Application = "Application",
  Analysis = "Analysis",
  Synthesis = "Synthesis",
  Evaluation = "Evaluation",
}


export type AssessTemplate = {
  __typename: "AssessTemplate",
  id: string,
  name?: string | null,
  docLang?: Lang | null,
  assessType?: AssessType | null,
  taxonomy?: Taxonomy | null,
  totalQuestions?: number | null,
  easyQuestions?: number | null,
  mediumQuestions?: number | null,
  hardQuestions?: number | null,
  createdAt?: string | null,
};

export type AssessmentInput = {
  id: string,
  name: string,
  courseId: string,
  lectureDate: string,
  deadline: string,
  assessType: AssessType,
  multiChoiceAssessment?: Array< MultiChoiceInput | null > | null,
  freeTextAssessment?: Array< FreeTextInput | null > | null,
  published?: boolean | null,
  status: AssessStatus,
};

export type MultiChoiceInput = {
  title: string,
  question: string,
  answerChoices?: Array< string | null > | null,
  correctAnswer?: number | null,
  explanation: string,
};

export type FreeTextInput = {
  title: string,
  question: string,
  rubric: Array< RubricInput >,
};

export type RubricInput = {
  weight: number,
  point: string,
};

export enum AssessStatus {
  IN_PROGRESS = "IN_PROGRESS",
  CREATED = "CREATED",
  FAILED = "FAILED",
  PUBLISHED = "PUBLISHED",
}


export type Assessment = {
  __typename: "Assessment",
  id: string,
  name: string,
  courseId: string,
  lectureDate: string,
  deadline: string,
  updatedAt: string,
  assessType: AssessType,
  multiChoiceAssessment?:  Array<MultiChoice > | null,
  freeTextAssessment?:  Array<FreeText > | null,
  published: boolean,
  status: AssessStatus,
  course?: Course | null,
};

export type MultiChoice = {
  __typename: "MultiChoice",
  title: string,
  question: string,
  answerChoices: Array< string >,
  correctAnswer: number,
  explanation: string,
};

export type FreeText = {
  __typename: "FreeText",
  title: string,
  question: string,
  rubric:  Array<Rubric >,
};

export type Rubric = {
  __typename: "Rubric",
  weight: number,
  point: string,
};

export type StudentAssessmentInput = {
  parentAssessId: string,
  answers: string,
  score?: number | null,
  completed?: boolean | null,
};

export type StudentAssessment = {
  __typename: "StudentAssessment",
  parentAssessId: string,
  assessment?: Assessment | null,
  answers: string,
  completed?: boolean | null,
  score?: number | null,
  report?: string | null,
  updatedAt?: string | null,
};

export type Student = {
  __typename: "Student",
  id: string,
  firstName: string,
  lastName: string,
};

export type GenerateAssessmentInput = {
  name: string,
  courseId: string,
  lectureDate: string,
  deadline: string,
  locations: Array< string | null >,
  assessTemplateId?: string | null,
};

export type UpsertSettingsMutationVariables = {
  input?: UpsertSettingsInput | null,
};

export type UpsertSettingsMutation = {
  upsertSettings?:  {
    __typename: "Settings",
    uiLang?: Lang | null,
    docLang?: Lang | null,
    assessType?: AssessType | null,
  } | null,
};

export type UpsertCourseMutationVariables = {
  input?: CourseInput | null,
};

export type UpsertCourseMutation = {
  upsertCourse?:  {
    __typename: "Course",
    id: string,
    name?: string | null,
    description?: string | null,
  } | null,
};

export type CreateAssessTemplateMutationVariables = {
  input?: AssessTemplateInput | null,
};

export type CreateAssessTemplateMutation = {
  createAssessTemplate?:  {
    __typename: "AssessTemplate",
    id: string,
    name?: string | null,
    docLang?: Lang | null,
    assessType?: AssessType | null,
    taxonomy?: Taxonomy | null,
    totalQuestions?: number | null,
    easyQuestions?: number | null,
    mediumQuestions?: number | null,
    hardQuestions?: number | null,
    createdAt?: string | null,
  } | null,
};

export type UpsertAssessmentMutationVariables = {
  input?: AssessmentInput | null,
};

export type UpsertAssessmentMutation = {
  upsertAssessment?:  {
    __typename: "Assessment",
    id: string,
    name: string,
    courseId: string,
    lectureDate: string,
    deadline: string,
    updatedAt: string,
    assessType: AssessType,
    multiChoiceAssessment?:  Array< {
      __typename: "MultiChoice",
      title: string,
      question: string,
      answerChoices: Array< string >,
      correctAnswer: number,
      explanation: string,
    } > | null,
    freeTextAssessment?:  Array< {
      __typename: "FreeText",
      title: string,
      question: string,
      rubric:  Array< {
        __typename: "Rubric",
        weight: number,
        point: string,
      } >,
    } > | null,
    published: boolean,
    status: AssessStatus,
    course?:  {
      __typename: "Course",
      id: string,
      name?: string | null,
      description?: string | null,
    } | null,
  } | null,
};

export type UpsertStudentAssessmentMutationVariables = {
  input?: StudentAssessmentInput | null,
};

export type UpsertStudentAssessmentMutation = {
  upsertStudentAssessment?:  {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name: string,
      courseId: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      assessType: AssessType,
      multiChoiceAssessment?:  Array< {
        __typename: "MultiChoice",
        title: string,
        question: string,
        answerChoices: Array< string >,
        correctAnswer: number,
        explanation: string,
      } > | null,
      freeTextAssessment?:  Array< {
        __typename: "FreeText",
        title: string,
        question: string,
        rubric:  Array< {
          __typename: "Rubric",
          weight: number,
          point: string,
        } >,
      } > | null,
      published: boolean,
      status: AssessStatus,
      course?:  {
        __typename: "Course",
        id: string,
        name?: string | null,
        description?: string | null,
      } | null,
    } | null,
    answers: string,
    completed?: boolean | null,
    score?: number | null,
    report?: string | null,
    updatedAt?: string | null,
  } | null,
};

export type GradeStudentAssessmentMutationVariables = {
  input?: StudentAssessmentInput | null,
};

export type GradeStudentAssessmentMutation = {
  gradeStudentAssessment?:  {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name: string,
      courseId: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      assessType: AssessType,
      multiChoiceAssessment?:  Array< {
        __typename: "MultiChoice",
        title: string,
        question: string,
        answerChoices: Array< string >,
        correctAnswer: number,
        explanation: string,
      } > | null,
      freeTextAssessment?:  Array< {
        __typename: "FreeText",
        title: string,
        question: string,
        rubric:  Array< {
          __typename: "Rubric",
          weight: number,
          point: string,
        } >,
      } > | null,
      published: boolean,
      status: AssessStatus,
      course?:  {
        __typename: "Course",
        id: string,
        name?: string | null,
        description?: string | null,
      } | null,
    } | null,
    answers: string,
    completed?: boolean | null,
    score?: number | null,
    report?: string | null,
    updatedAt?: string | null,
  } | null,
};

export type GetSettingsQuery = {
  getSettings?:  {
    __typename: "Settings",
    uiLang?: Lang | null,
    docLang?: Lang | null,
    assessType?: AssessType | null,
  } | null,
};

export type ListCoursesQuery = {
  listCourses?:  Array< {
    __typename: "Course",
    id: string,
    name?: string | null,
    description?: string | null,
  } | null > | null,
};

export type ListStudentsQuery = {
  listStudents?:  Array< {
    __typename: "Student",
    id: string,
    firstName: string,
    lastName: string,
  } | null > | null,
};

export type GetAssessmentQueryVariables = {
  id: string,
};

export type GetAssessmentQuery = {
  getAssessment?:  {
    __typename: "Assessment",
    id: string,
    name: string,
    courseId: string,
    lectureDate: string,
    deadline: string,
    updatedAt: string,
    assessType: AssessType,
    multiChoiceAssessment?:  Array< {
      __typename: "MultiChoice",
      title: string,
      question: string,
      answerChoices: Array< string >,
      correctAnswer: number,
      explanation: string,
    } > | null,
    freeTextAssessment?:  Array< {
      __typename: "FreeText",
      title: string,
      question: string,
      rubric:  Array< {
        __typename: "Rubric",
        weight: number,
        point: string,
      } >,
    } > | null,
    published: boolean,
    status: AssessStatus,
    course?:  {
      __typename: "Course",
      id: string,
      name?: string | null,
      description?: string | null,
    } | null,
  } | null,
};

export type ListAssessmentsQuery = {
  listAssessments?:  Array< {
    __typename: "Assessment",
    id: string,
    name: string,
    courseId: string,
    lectureDate: string,
    deadline: string,
    updatedAt: string,
    assessType: AssessType,
    multiChoiceAssessment?:  Array< {
      __typename: "MultiChoice",
      title: string,
      question: string,
      answerChoices: Array< string >,
      correctAnswer: number,
      explanation: string,
    } > | null,
    freeTextAssessment?:  Array< {
      __typename: "FreeText",
      title: string,
      question: string,
      rubric:  Array< {
        __typename: "Rubric",
        weight: number,
        point: string,
      } >,
    } > | null,
    published: boolean,
    status: AssessStatus,
    course?:  {
      __typename: "Course",
      id: string,
      name?: string | null,
      description?: string | null,
    } | null,
  } | null > | null,
};

export type ListAssessTemplatesQuery = {
  listAssessTemplates?:  Array< {
    __typename: "AssessTemplate",
    id: string,
    name?: string | null,
    docLang?: Lang | null,
    assessType?: AssessType | null,
    taxonomy?: Taxonomy | null,
    totalQuestions?: number | null,
    easyQuestions?: number | null,
    mediumQuestions?: number | null,
    hardQuestions?: number | null,
    createdAt?: string | null,
  } | null > | null,
};

export type GetStudentAssessmentQueryVariables = {
  parentAssessId: string,
};

export type GetStudentAssessmentQuery = {
  getStudentAssessment?:  {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name: string,
      courseId: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      assessType: AssessType,
      multiChoiceAssessment?:  Array< {
        __typename: "MultiChoice",
        title: string,
        question: string,
        answerChoices: Array< string >,
        correctAnswer: number,
        explanation: string,
      } > | null,
      freeTextAssessment?:  Array< {
        __typename: "FreeText",
        title: string,
        question: string,
        rubric:  Array< {
          __typename: "Rubric",
          weight: number,
          point: string,
        } >,
      } > | null,
      published: boolean,
      status: AssessStatus,
      course?:  {
        __typename: "Course",
        id: string,
        name?: string | null,
        description?: string | null,
      } | null,
    } | null,
    answers: string,
    completed?: boolean | null,
    score?: number | null,
    report?: string | null,
    updatedAt?: string | null,
  } | null,
};

export type ListStudentAssessmentsQuery = {
  listStudentAssessments?:  Array< {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name: string,
      courseId: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      assessType: AssessType,
      multiChoiceAssessment?:  Array< {
        __typename: "MultiChoice",
        title: string,
        question: string,
        answerChoices: Array< string >,
        correctAnswer: number,
        explanation: string,
      } > | null,
      freeTextAssessment?:  Array< {
        __typename: "FreeText",
        title: string,
        question: string,
        rubric:  Array< {
          __typename: "Rubric",
          weight: number,
          point: string,
        } >,
      } > | null,
      published: boolean,
      status: AssessStatus,
      course?:  {
        __typename: "Course",
        id: string,
        name?: string | null,
        description?: string | null,
      } | null,
    } | null,
    answers: string,
    completed?: boolean | null,
    score?: number | null,
    report?: string | null,
    updatedAt?: string | null,
  } | null > | null,
};

export type ListMyStudentAssessmentsQueryVariables = {
  studentId: string,
};

export type ListMyStudentAssessmentsQuery = {
  listMyStudentAssessments?:  Array< {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name: string,
      courseId: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      assessType: AssessType,
      multiChoiceAssessment?:  Array< {
        __typename: "MultiChoice",
        title: string,
        question: string,
        answerChoices: Array< string >,
        correctAnswer: number,
        explanation: string,
      } > | null,
      freeTextAssessment?:  Array< {
        __typename: "FreeText",
        title: string,
        question: string,
        rubric:  Array< {
          __typename: "Rubric",
          weight: number,
          point: string,
        } >,
      } > | null,
      published: boolean,
      status: AssessStatus,
      course?:  {
        __typename: "Course",
        id: string,
        name?: string | null,
        description?: string | null,
      } | null,
    } | null,
    answers: string,
    completed?: boolean | null,
    score?: number | null,
    report?: string | null,
    updatedAt?: string | null,
  } | null > | null,
};

export type PublishAssessmentQueryVariables = {
  assessmentId: string,
};

export type PublishAssessmentQuery = {
  publishAssessment?: boolean | null,
};

export type CreateKnowledgeBaseQueryVariables = {
  courseId?: string | null,
  locations?: Array< string | null > | null,
};

export type CreateKnowledgeBaseQuery = {
  createKnowledgeBase?: string | null,
};

export type GenerateAssessmentQueryVariables = {
  input?: GenerateAssessmentInput | null,
};

export type GenerateAssessmentQuery = {
  generateAssessment?: string | null,
};
