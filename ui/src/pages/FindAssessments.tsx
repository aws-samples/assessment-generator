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
              id: 'coarse',
              header: 'Coarse',
              cell: (item) => item.coarse,
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
            {
              id: 'publish',
              header: '',
              cell: (item) => (
                <Button
                  onClick={() =>
                    client
                      .graphql<any>({ query: publishAssessment, variables: { assessmentId: item.id, classId: item.classId } })
                      .then(() => dispatchAlert({ type: AlertType.SUCCESS, content: 'Published successfully to students' }))
                      .catch(() => dispatchAlert({ type: AlertType.ERROR }))
                  }
                >
                  publish
                </Button>
              ),
            },
          ]}
          columnDisplay={[
            { id: 'name', visible: true },
            { id: 'coarse', visible: true },
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