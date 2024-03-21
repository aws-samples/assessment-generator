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
  lecture: string,
  lectureDate: string,
  deadline: string,
  questions: Array< QandAInput | null >,
};

export type QandAInput = {
  title?: string | null,
  question?: string | null,
  answers?: Array< string | null > | null,
};

export type Assessment = {
  __typename: "Assessment",
  id: string,
  name?: string | null,
  coarse?: string | null,
  lecture?: string | null,
  lectureDate?: string | null,
  deadline?: string | null,
  updatedAt?: string | null,
  questions:  Array<QandA >,
};

export type QandA = {
  __typename: "QandA",
  title: string,
  question: string,
  answers: Array< string >,
};

export type StudentAssessmentInput = {
  parentAssessId: string,
  answers?: Array< number | null > | null,
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
    lecture?: string | null,
    lectureDate?: string | null,
    deadline?: string | null,
    updatedAt?: string | null,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
    } >,
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
      lecture?: string | null,
      lectureDate?: string | null,
      deadline?: string | null,
      updatedAt?: string | null,
    } | null,
    answers?: Array< number | null > | null,
    status?: AssessmentStatus | null,
    createdAt?: string | null,
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

export type ListCoarsesQueryVariables = {
};

export type ListCoarsesQuery = {
  listCoarses?:  Array< {
    __typename: "Coarse",
    id: string,
    name?: string | null,
    description?: string | null,
  } | null > | null,
};

export type ListClassesQueryVariables = {
};

export type ListClassesQuery = {
  listClasses?:  Array< {
    __typename: "Class",
    id: string,
    name?: string | null,
    students?: Array< string | null > | null,
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
    name?: string | null,
    coarse?: string | null,
    lecture?: string | null,
    lectureDate?: string | null,
    deadline?: string | null,
    updatedAt?: string | null,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
    } >,
  } | null,
};

export type ListAssessmentsQueryVariables = {
};

export type ListAssessmentsQuery = {
  listAssessments?:  Array< {
    __typename: "Assessment",
    id: string,
    name?: string | null,
    coarse?: string | null,
    lecture?: string | null,
    lectureDate?: string | null,
    deadline?: string | null,
    updatedAt?: string | null,
    questions:  Array< {
      __typename: "QandA",
      title: string,
      question: string,
      answers: Array< string >,
    } >,
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
      lecture?: string | null,
      lectureDate?: string | null,
      deadline?: string | null,
      updatedAt?: string | null,
    } | null,
    answers?: Array< number | null > | null,
    status?: AssessmentStatus | null,
    createdAt?: string | null,
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
      name?: string | null,
      coarse?: string | null,
      lecture?: string | null,
      lectureDate?: string | null,
      deadline?: string | null,
      updatedAt?: string | null,
    } | null,
    answers?: Array< number | null > | null,
    status?: AssessmentStatus | null,
    createdAt?: string | null,
  } | null > | null,
};
