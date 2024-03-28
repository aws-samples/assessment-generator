import { useState, useEffect, useContext } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Link, Box, TextFilter, Button } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listAssessments, publishAssessment } from '../graphql/queries';
import { Assessment } from '../graphql/API';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

export default () => {
  const dispatchAlert = useContext(DispatchAlertContext);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    client
      .graphql<any>({ query: listAssessments })
      .then(({ data }) => setAssessments(data.listAssessments || []))
      .catch(() => dispatchAlert({ type: AlertType.ERROR }));
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
              id: 'course',
              header: 'Course',
              cell: (item) => item.course,
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
              cell: (item) => (item.published ? null : <Link href={`/edit-assessment/${item.id}`}>edit</Link>),
            },
            {
              id: 'publish',
              header: '',
              cell: (item) => (
                <Button
                  disabled={!!item.published}
                  onClick={() =>
                    client
                      .graphql<any>({ query: publishAssessment, variables: { assessmentId: item.id } })
                      .then(() => dispatchAlert({ type: AlertType.SUCCESS, content: 'Published successfully to students' }))
                      .catch(() => dispatchAlert({ type: AlertType.ERROR }))
                  }
                >
                  {item.published ? 'Published' : 'Publish'}
                </Button>
              ),
            },
          ]}
          columnDisplay={[
            { id: 'name', visible: true },
            { id: 'course', visible: true },
            { id: 'lectureDate', visible: true },
            { id: 'deadline', visible: true },
            { id: 'updatedAt', visible: true },
            { id: 'edit', visible: true },
            { id: 'publish', visible: true },
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
