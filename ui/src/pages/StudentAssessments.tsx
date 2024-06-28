import { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, Pagination } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { listStudentAssessments } from '../graphql/queries';
import { StudentAssessment } from '../graphql/API';

const client = generateClient();

export default () => {
  const navigate = useNavigate();

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
              id: 'name',
              header: 'Name',
              cell: (item) => item.assessment!.name,
              sortingField: 'name',
            },
            {
              id: 'course',
              header: 'Course',
              cell: (item) => item.assessment!.course?.name,
              sortingField: 'course',
            },
            {
              id: 'deadline',
              header: 'Deadline',
              cell: (item) => new Date(item.assessment!.deadline).toDateString(),
              sortingField: 'course',
            },
            {
              id: 'action',
              header: 'Action',
              cell: (item) =>
                item.completed ? (
                  <Button onClick={() => navigate('/review/' + item.parentAssessId)}>Review</Button>
                ) : (
                  <Button onClick={() => navigate('/assessment/' + item.parentAssessId)}>Start</Button>
                ),
            },
            {
              id: 'score',
              header: 'Score',
              cell: (item) => (item.completed ? item.score + '%' : ''),
            },
          ]}
          columnDisplay={[
            { id: 'name', visible: true },
            { id: 'course', visible: true },
            { id: 'deadline', visible: true },
            { id: 'score', visible: true },
            { id: 'action', visible: true },
          ]}
          items={assessments}
          loadingText="Loading list"
          trackBy="id"
          empty={
            <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
              Empty
            </Box>
          }
          // filter={<TextFilter filteringPlaceholder="Find resources" filteringText="" />}
          pagination={<Pagination currentPageIndex={1} pagesCount={1} />}
        />
      </Container>
    </ContentLayout>
  );
};
