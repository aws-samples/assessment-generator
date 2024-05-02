import { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, Pagination, Modal } from '@cloudscape-design/components';
import Dashboard, { DashboardProps } from '../components/Dashboard';
import { generateClient } from 'aws-amplify/api';
import { listStudents, listMyStudentAssessments } from '../graphql/queries';
import { Student, StudentAssessment } from '../graphql/API';

const client = generateClient();

export default () => {
  const [dashboardData, setDashboardData] = useState<DashboardProps['data']>();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    client
      .graphql<any>({ query: listStudents })
      .then(({ data }) => setStudents(data.listStudents || []))
      .catch(() => {});
  }, []);

  function fetchStudentData(studentId: string) {
    client
      .graphql<any>({ query: listMyStudentAssessments, variables: { studentId } })
      .then(({ data: result }) => {
        const assessments: StudentAssessment[] = result.listMyStudentAssessments || [];
        const data = assessments
          .filter((assessment) => assessment.score)
          .map((assessment) => ({ x: new Date(assessment.updatedAt!), y: assessment.score! }));
        setDashboardData(data);
      })
      .catch(() => {});
  }

  return (
    <>
      <Modal onDismiss={() => setDashboardData(undefined)} visible={!!dashboardData} header="Dashboard">
        {dashboardData ? <Dashboard data={dashboardData} /> : null}
      </Modal>
      <ContentLayout>
        <Container
          header={
            <SpaceBetween size="l">
              <Header variant="h1">Students:</Header>
            </SpaceBetween>
          }
        >
          <Table
            columnDefinitions={[
              {
                id: 'id',
                header: 'Student Id',
                cell: (item) => item.id,
                sortingField: 'id',
                isRowHeader: true,
              },
              {
                id: 'firstName',
                header: 'First Name',
                cell: (item) => item.firstName,
              },
              {
                id: 'lastName',
                header: 'Last Name',
                cell: (item) => item.lastName,
              },
              {
                id: 'dashboards',
                header: 'Dashboards',
                cell: (item) => <Button onClick={() => fetchStudentData(item.id)}>Generate Dashboard</Button>,
              },
            ]}
            columnDisplay={[
              { id: 'id', visible: true },
              { id: 'firstName', visible: true },
              { id: 'lastName', visible: true },
              { id: 'dashboards', visible: true },
            ]}
            items={students}
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
    </>
  );
};
