import React, { useState } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Link, Box, TextFilter } from '@cloudscape-design/components';

const assessments = [
  { id: '111', coarse: 'Refrigeration', subject: 'Chemistry', status: 'Start' },
  { id: '111', coarse: 'Cardiology', subject: 'Biology', status: 'Resume' },
  { id: '111', coarse: 'Probabilities', subject: 'Maths', status: 'Completed' },
];

export default () => {
  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Assessments:</Header>
          </SpaceBetween>
        }
      >
        <Table
          columnDefinitions={[
            {
              id: 'id',
              header: 'Id',
              cell: (item) => item.id,
              sortingField: 'id',
              isRowHeader: true,
            },
            {
              id: 'subject',
              header: 'Subject',
              cell: (item) => item.subject,
            },
            {
              id: 'coarse',
              header: 'Coarse',
              cell: (item) => item.coarse,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (item.status === 'Completed' ? item.status : <Link href={`/assessment/${item.id}`}>{item.status}</Link>),
            },
          ]}
          columnDisplay={[
            { id: 'id', visible: true },
            { id: 'subject', visible: true },
            { id: 'type', visible: true },
            { id: 'status', visible: true },
          ]}
          items={assessments}
          loadingText="Loading list"
          trackBy="id"
          empty={
            <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
              Empty
            </Box>
          }
          filter={<TextFilter filteringPlaceholder="Find resources" filteringText="" />}
        />
      </Container>
    </ContentLayout>
  );
};
