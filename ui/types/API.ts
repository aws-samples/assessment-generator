/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateFeedbackInput = {
  summaryid: string,
  feedback: number,
};

export type Feedback = {
  __typename: "Feedback",
  summaryid: string,
  feedback?: number | null,
  timestamp?: string | null,
  summary?: Summary | null,
};

export type Summary = {
  __typename: "Summary",
  id: string,
  name?: string | null,
  contents?: Array< string | null > | null,
  timestamp?: string | null,
  stats?:  Array<Stat | null > | null,
  feedback?: Feedback | null,
};

export type Stat = {
  __typename: "Stat",
  feedback?: number | null,
  count?: number | null,
};

export type CreateFeedbackMutationVariables = {
  input: CreateFeedbackInput,
};

export type CreateFeedbackMutation = {
  createFeedback?:  {
    __typename: "Feedback",
    summaryid: string,
    feedback?: number | null,
    timestamp?: string | null,
    summary?:  {
      __typename: "Summary",
      id: string,
      name?: string | null,
      contents?: Array< string | null > | null,
      timestamp?: string | null,
    } | null,
  } | null,
};

export type ListSummariesQueryVariables = {
};

export type ListSummariesQuery = {
  listSummaries?:  Array< {
    __typename: "Summary",
    id: string,
    name?: string | null,
    contents?: Array< string | null > | null,
    timestamp?: string | null,
    stats?:  Array< {
      __typename: "Stat",
      feedback?: number | null,
      count?: number | null,
    } | null > | null,
    feedback?:  {
      __typename: "Feedback",
      summaryid: string,
      feedback?: number | null,
      timestamp?: string | null,
    } | null,
  } | null > | null,
};

export type GetSummaryQueryVariables = {
  id?: string | null,
};

export type GetSummaryQuery = {
  getSummary?:  {
    __typename: "Summary",
    id: string,
    name?: string | null,
    contents?: Array< string | null > | null,
    timestamp?: string | null,
    stats?:  Array< {
      __typename: "Stat",
      feedback?: number | null,
      count?: number | null,
    } | null > | null,
    feedback?:  {
      __typename: "Feedback",
      summaryid: string,
      feedback?: number | null,
      timestamp?: string | null,
    } | null,
  } | null,
};

export type ListFeedbacksQueryVariables = {
};

export type ListFeedbacksQuery = {
  listFeedbacks?:  Array< {
    __typename: "Feedback",
    summaryid: string,
    feedback?: number | null,
    timestamp?: string | null,
    summary?:  {
      __typename: "Summary",
      id: string,
      name?: string | null,
      contents?: Array< string | null > | null,
      timestamp?: string | null,
    } | null,
  } | null > | null,
};

export type GetFeedbackQueryVariables = {
  summaryid?: string | null,
};

export type GetFeedbackQuery = {
  getFeedback?:  {
    __typename: "Feedback",
    summaryid: string,
    feedback?: number | null,
    timestamp?: string | null,
    summary?:  {
      __typename: "Summary",
      id: string,
      name?: string | null,
      contents?: Array< string | null > | null,
      timestamp?: string | null,
    } | null,
  } | null,
};
