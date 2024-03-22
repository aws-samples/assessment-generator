import { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Link, Box, TextFilter } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listStudentAssessments } from '../graphql/queries';
import { StudentAssessment, AssessmentStatus } from '../graphql/API';

const client = generateClient();

export default () => {
  const [assessments, setAssessments] = useState<StudentAssessment[]>([]);

  useEffect(() => {
    client
      .graphql<any>({ query: listStudentAssessments })
      .then(({ data }) => {
        const list = data.listStudentAssessments || [];
        setAssessments(list);
      })
      .catch(() => {});
  }, []);

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
              id: 'parentAssessId',
              header: 'Assessment Id',
              cell: (item) => item.parentAssessId,
              sortingField: 'id',
              isRowHeader: true,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) =>
                item.status === AssessmentStatus.Completed ? item.status : <Link href={`/assessment/${item.parentAssessId}`}>{item.status}</Link>,
            },
            {
              id: 'score',
              header: 'Score',
              cell: (item) => (item.status === AssessmentStatus.Completed ? item.score + '%' : ''),
            },
          ]}
          columnDisplay={[
            { id: 'parentAssessId', visible: true },
            { id: 'status', visible: true },
            { id: 'score', visible: true },
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
