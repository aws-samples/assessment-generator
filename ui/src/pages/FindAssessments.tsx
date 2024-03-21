import React, { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Link, Box, TextFilter } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listAssessments } from '../graphql/queries';
import { Assessment } from '../graphql/API';

const client = generateClient();

export default () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    (async () => {
      const list: any = (await client.graphql({ query: listAssessments })).data.listAssessments || [];
      setAssessments(list);
    })();
  }, []);

  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Find Assessments:</Header>
          </SpaceBetween>
        }
      >
        <Table
          columnDefinitions={[
            {
              id: 'name',
              header: 'Name',
              cell: (item) => item.name,
            },
            {
              id: 'coarse',
              header: 'Coarse',
              cell: (item) => item.coarse,
            },
            {
              id: 'lecture',
              header: 'Lecture',
              cell: (item) => item.lecture,
            },
            {
              id: 'lectureDate',
              header: 'Lecture Date',
              cell: (item) => item.lectureDate,
            },
            {
              id: 'deadline',
              header: 'Deadline',
              cell: (item) => item.deadline,
            },
            {
              id: 'updatedAt',
              header: 'Updated At',
              cell: (item) => item.updatedAt,
            },
            {
              id: 'edit',
              header: '',
              cell: (item) => <Link href={`/edit-assessment/${item.id}`}>edit</Link>,
            },
          ]}
          columnDisplay={[
            { id: 'name', visible: true },
            { id: 'coarse', visible: true },
            { id: 'lecture', visible: true },
            { id: 'lectureDate', visible: true },
            { id: 'deadline', visible: true },
            { id: 'updatedAt', visible: true },
            { id: 'edit', visible: true },
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
