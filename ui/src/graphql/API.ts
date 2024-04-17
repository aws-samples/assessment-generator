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
  MultipleChoiceQuestionnaire = "MultipleChoiceQuestionnaire",
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
  totalQuestions: number,
  easyQuestions: number,
  mediumQuestions: number,
  hardQuestions: number,
};

export type AssessTemplate = {
  __typename: "AssessTemplate",
  id: string,
  name?: string | null,
  docLang?: Lang | null,
  assessType?: AssessType | null,
  totalQuestions?: number | null,
  easyQuestions?: number | null,
  mediumQuestions?: number | null,
  hardQuestions?: number | null,
  createdAt?: string | null,
};

export type AssessmentInput = {
  id: string,
  name: string,
  course: string,
  lectureDate: string,
  deadline: string,
  questions: Array< QandAInput >,
  published?: boolean | null,
  status: AssessStatus,
};

export type QandAInput = {
  title: string,
  question: string,
  answers: Array< string | null >,
  correctAnswer: number,
  explanation: string,
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
  course: string,
  lectureDate: string,
  deadline: string,
  updatedAt: string,
  questions:  Array<QandA >,
  published: boolean,
  status: AssessStatus,
};

export type QandA = {
  __typename: "QandA",
  title: string,
  question: string,
  answers: Array< string >,
  correctAnswer: number,
  explanation: string,
};

export type StudentAssessmentInput = {
  parentAssessId: string,
  chosenAnswers?: Array< number | null > | null,
  score?: number | null,
  completed?: boolean | null,
};

export type StudentAssessment = {
  __typename: "StudentAssessment",
  parentAssessId: string,
  assessment?: Assessment | null,
  chosenAnswers?: Array< number | null > | null,
  completed?: boolean | null,
  score?: number | null,
  updatedAt?: string | null,
};

export type Student = {
  __typename: "Student",
  id: string,
  firstName?: string | null,
  lastName?: string | null,
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
    course: string,
    lectureDate: string,
    deadline: string,
    updatedAt: string,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
      correctAnswer: number,
      explanation: string,
    } >,
    published: boolean,
    status: AssessStatus,
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
      course: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      questions:  Array< {
        __typename: "QandA",
        title: string,
        question: string,
        answers: Array< string >,
        correctAnswer: number,
        explanation: string,
      } >,
      published: boolean,
      status: AssessStatus,
    } | null,
    chosenAnswers?: Array< number | null > | null,
    completed?: boolean | null,
    score?: number | null,
    updatedAt?: string | null,
  } | null,
};

export type GetSettingsQueryVariables = {
};

export type GetSettingsQuery = {
  getSettings?:  {
    __typename: "Settings",
    uiLang?: Lang | null,
    docLang?: Lang | null,
    assessType?: AssessType | null,
  } | null,
};

export type ListCoursesQueryVariables = {
};

export type ListCoursesQuery = {
  listCourses?:  Array< {
    __typename: "Course",
    id: string,
    name?: string | null,
    description?: string | null,
  } | null > | null,
};

export type ListStudentsQueryVariables = {
};

export type ListStudentsQuery = {
  listStudents?:  Array< {
    __typename: "Student",
    id: string,
    firstName?: string | null,
    lastName?: string | null,
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
    course: string,
    lectureDate: string,
    deadline: string,
    updatedAt: string,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
      correctAnswer: number,
      explanation: string,
    } >,
    published: boolean,
    status: AssessStatus,
  } | null,
};

export type ListAssessmentsQueryVariables = {
};

export type ListAssessmentsQuery = {
  listAssessments?:  Array< {
    __typename: "Assessment",
    id: string,
    name: string,
    course: string,
    lectureDate: string,
    deadline: string,
    updatedAt: string,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
      correctAnswer: number,
      explanation: string,
    } >,
    published: boolean,
    status: AssessStatus,
  } | null > | null,
};

export type ListAssessTemplatesQueryVariables = {
};

export type ListAssessTemplatesQuery = {
  listAssessTemplates?:  Array< {
    __typename: "AssessTemplate",
    id: string,
    name?: string | null,
    docLang?: Lang | null,
    assessType?: AssessType | null,
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
      course: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      questions:  Array< {
        __typename: "QandA",
        title: string,
        question: string,
        answers: Array< string >,
        correctAnswer: number,
        explanation: string,
      } >,
      published: boolean,
      status: AssessStatus,
    } | null,
    chosenAnswers?: Array< number | null > | null,
    completed?: boolean | null,
    score?: number | null,
    updatedAt?: string | null,
  } | null,
};

export type ListStudentAssessmentsQueryVariables = {
};

export type ListStudentAssessmentsQuery = {
  listStudentAssessments?:  Array< {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name: string,
      course: string,
      lectureDate: string,
      deadline: string,
      updatedAt: string,
      questions:  Array< {
        __typename: "QandA",
        title: string,
        question: string,
        answers: Array< string >,
        correctAnswer: number,
        explanation: string,
      } >,
      published: boolean,
      status: AssessStatus,
    } | null,
    chosenAnswers?: Array< number | null > | null,
    completed?: boolean | null,
    score?: number | null,
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
