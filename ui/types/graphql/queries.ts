/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const listSummaries = /* GraphQL */ `query ListSummaries {
  listSummaries {
    id
    name
    contents
    timestamp
    stats {
      feedback
      count
      __typename
    }
    feedback {
      summaryid
      feedback
      timestamp
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSummariesQueryVariables,
  APITypes.ListSummariesQuery
>;
export const getSummary = /* GraphQL */ `query GetSummary($id: ID) {
  getSummary(id: $id) {
    id
    name
    contents
    timestamp
    stats {
      feedback
      count
      __typename
    }
    feedback {
      summaryid
      feedback
      timestamp
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSummaryQueryVariables,
  APITypes.GetSummaryQuery
>;
export const listFeedbacks = /* GraphQL */ `query ListFeedbacks {
  listFeedbacks {
    summaryid
    feedback
    timestamp
    summary {
      id
      name
      contents
      timestamp
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListFeedbacksQueryVariables,
  APITypes.ListFeedbacksQuery
>;
export const getFeedback = /* GraphQL */ `query GetFeedback($summaryid: ID) {
  getFeedback(summaryid: $summaryid) {
    summaryid
    feedback
    timestamp
    summary {
      id
      name
      contents
      timestamp
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetFeedbackQueryVariables,
  APITypes.GetFeedbackQuery
>;
