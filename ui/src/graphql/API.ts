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
  Type1 = "Type1",
  Type2 = "Type2",
  Type3 = "Type3",
}


export type Settings = {
  __typename: "Settings",
  uiLang?: Lang | null,
  docLang?: Lang | null,
  assessType?: AssessType | null,
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
  coarse: string,
  class: string,
  lectureDate: string,
  deadline: string,
  questions: Array< QandAInput | null >,
};

export type QandAInput = {
  title?: string | null,
  question?: string | null,
  answers?: Array< string | null > | null,
  correctAnswer: number,
};

export type Assessment = {
  __typename: "Assessment",
  id: string,
  name?: string | null,
  coarse?: string | null,
  class?: string | null,
  lectureDate?: string | null,
  deadline?: string | null,
  updatedAt?: string | null,
  questions:  Array<QandA >,
  published?: boolean | null,
};

export type QandA = {
  __typename: "QandA",
  title: string,
  question: string,
  answers: Array< string >,
  correctAnswer: number,
};

export type StudentAssessmentInput = {
  parentAssessId: string,
  answers?: Array< number | null > | null,
  score?: number | null,
  status?: AssessmentStatus | null,
};

export enum AssessmentStatus {
  Start = "Start",
  InProgress = "InProgress",
  Completed = "Completed",
}


export type StudentAssessment = {
  __typename: "StudentAssessment",
  parentAssessId: string,
  assessment?: Assessment | null,
  answers?: Array< number | null > | null,
  status?: AssessmentStatus | null,
  score?: number | null,
  createdAt?: string | null,
};

export type Coarse = {
  __typename: "Coarse",
  id: string,
  name?: string | null,
  description?: string | null,
};

export type Class = {
  __typename: "Class",
  id: string,
  name?: string | null,
  students?: Array< string | null > | null,
};

export type Student = {
  __typename: "Student",
  id: string,
  firstName?: string | null,
  lastName?: string | null,
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
    name?: string | null,
    coarse?: string | null,
    class?: string | null,
    lectureDate?: string | null,
    deadline?: string | null,
    updatedAt?: string | null,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
      correctAnswer: number,
    } >,
    published?: boolean | null,
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
      name?: string | null,
      coarse?: string | null,
      class?: string | null,
      lectureDate?: string | null,
      deadline?: string | null,
      updatedAt?: string | null,
      questions:  Array< {
        __typename: "QandA",
        title: string,
        question: string,
        answers: Array< string >,
        correctAnswer: number,
      } >,
      published?: boolean | null,
    } | null,
    answers?: Array< number | null > | null,
    status?: AssessmentStatus | null,
    score?: number | null,
    createdAt?: string | null,
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

export type ListCoarsesQuery = {
  listCoarses?:  Array< {
    __typename: "Coarse",
    id: string,
    name?: string | null,
    description?: string | null,
  } | null > | null,
};

export type ListClassesQuery = {
  listClasses?:  Array< {
    __typename: "Class",
    id: string,
    name?: string | null,
    students?: Array< string | null > | null,
  } | null > | null,
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
    name?: string | null,
    coarse?: string | null,
    class?: string | null,
    lectureDate?: string | null,
    deadline?: string | null,
    updatedAt?: string | null,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
      correctAnswer: number,
    } >,
    published?: boolean | null,
  } | null,
};

export type ListAssessmentsQuery = {
  listAssessments?:  Array< {
    __typename: "Assessment",
    id: string,
    name?: string | null,
    coarse?: string | null,
    class?: string | null,
    lectureDate?: string | null,
    deadline?: string | null,
    updatedAt?: string | null,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
      correctAnswer: number,
    } >,
    published?: boolean | null,
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
      name?: string | null,
      coarse?: string | null,
      class?: string | null,
      lectureDate?: string | null,
      deadline?: string | null,
      updatedAt?: string | null,
      questions:  Array< {
        __typename: "QandA",
        title: string,
        question: string,
        answers: Array< string >,
        correctAnswer: number,
      } >,
      published?: boolean | null,
    } | null,
    answers?: Array< number | null > | null,
    status?: AssessmentStatus | null,
    score?: number | null,
    createdAt?: string | null,
  } | null,
};

export type ListStudentAssessmentsQuery = {
  listStudentAssessments?:  Array< {
    __typename: "StudentAssessment",
    parentAssessId: string,
    assessment?:  {
      __typename: "Assessment",
      id: string,
      name?: string | null,
      coarse?: string | null,
      class?: string | null,
      lectureDate?: string | null,
      deadline?: string | null,
      updatedAt?: string | null,
      questions:  Array< {
        __typename: "QandA",
        title: string,
        question: string,
        answers: Array< string >,
        correctAnswer: number,
      } >,
      published?: boolean | null,
    } | null,
    answers?: Array< number | null > | null,
    status?: AssessmentStatus | null,
    score?: number | null,
    createdAt?: string | null,
  } | null > | null,
};

export type PublishAssessmentQueryVariables = {
  assessmentId: string,
  class: string,
};

export type PublishAssessmentQuery = {
  publishAssessment?: boolean | null,
};
