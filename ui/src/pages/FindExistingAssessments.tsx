import React, { useState } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Link, Box, TextFilter } from '@cloudscape-design/components';

const assessments = [
  { id: '111', type: 'type1', subject: 'chemistry', status: 'inProgess' },
  { id: '222', type: 'type2', subject: 'biology', status: 'published' },
  { id: '333', type: 'type3', subject: 'maths', status: 'closed' },
];

export default () => {
  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Find Existing Assessments:</Header>
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
              id: 'type',
              header: 'Type',
              cell: (item) => item.type,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => item.status,
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
