import { useState, useEffect } from 'react';
import { ContentLayout, Container, Header, Box, SpaceBetween } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';
import { generateClient } from 'aws-amplify/api';
import { listStudentAssessments } from '../graphql/queries';
import { StudentAssessment } from '../graphql/API';

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

  const data = assessments
    .filter((assessment) => assessment.score)
    .map((assessment) => ({ x: new Date(assessment.updatedAt!), y: assessment.score! }));

  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">My Performance Dashboard</Header>
          </SpaceBetween>
        }
      >
        <Box padding="xxxl">
          <SpaceBetween size="l" alignItems="center">
            <Dashboard data={data} />
          </SpaceBetween>
        </Box>
      </Container>
    </ContentLayout>
  );
};
