'use client';

import React, { useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listSummaries } from '../../types/graphql/queries';
import { Summary } from '../../types/API';
import { Box, Header, Table, Link, TextFilter, Pagination, Toggle, SpaceBetween } from '@cloudscape-design/components';

const client = generateClient();

export default function Home() {
  const [summaries, setSummaries] = React.useState<Summary[]>([]);
  const [showAllFeedbacks, setShowAllFeedbacks] = React.useState<boolean>(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      const result = (await client.graphql({ query: listSummaries })).data.listSummaries;
      setSummaries((result || []) as any);
    };
    fetchSummaries();
  }, []);

  let filteredSummaries = summaries;
  if (!showAllFeedbacks) filteredSummaries = summaries.filter((summary) => summary.feedback);

  // noinspection TypeScriptValidateTypes
    return (
    <Table
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => <Link href={`/summary/${item.id}`}>{item.name}</Link>,
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'feedbacks',
          header: 'Feedbacks',
          cell: (item) => item.stats!.reduce((acc, { count }: any) => acc + count, 0),
        },
        {
          id: 'date',
          header: 'Date',
          cell: (item) => item.timestamp,
        },
        {
          id: 'giveFeedback',
          header: '',
          cell: (item) => <Link href={`/feedback/${item.id}`}>{item.feedback ? 'View Your Feedback' : 'Give Feedback'}</Link>,
        },
      ]}
      columnDisplay={[
        { id: 'name', visible: true },
        { id: 'feedbacks', visible: true },
        { id: 'date', visible: true },
        { id: 'giveFeedback', visible: true },
      ]}
      items={filteredSummaries}
      loadingText="Loading list"
      trackBy="name"
      empty={
        <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
          Empty
        </Box>
      }
      filter={
        <SpaceBetween size="l" direction="horizontal" alignItems="center">
          <TextFilter filteringPlaceholder="Find resources" filteringText="" />
          <Toggle checked={showAllFeedbacks} onChange={(e) => setShowAllFeedbacks(e.detail.checked)}>
            Show All Feedbacks
          </Toggle>
        </SpaceBetween>
      }
      header={<Header counter={summaries.length ? '(' + summaries.length + '/10)' : '(10)'}>Summaries</Header>}
      pagination={<Pagination currentPageIndex={1} pagesCount={2} />}
    />
  );
}
