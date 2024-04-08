import { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, Pagination, Modal } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';
import { generateClient } from 'aws-amplify/api';
import { listStudents } from '../graphql/queries';
import { Student } from '../graphql/API';

const client = generateClient();

export default () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    client
      .graphql<any>({ query: listStudents })
      .then(({ data }) => setStudents(data.listStudents || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Modal onDismiss={() => setShowDashboard(false)} visible={showDashboard} header="Dashboard">
        <Dashboard />
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
                header: 'Id',
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
                cell: (_item) => <Button onClick={() => setShowDashboard(true)}>Generate Dashboard</Button>,
              },
              {
                id: 'download',
                header: 'Downloads',
                cell: (_item) => <Button iconName="download">Download Data</Button>,
              },
            ]}
            columnDisplay={[
              { id: 'id', visible: true },
              { id: 'firstName', visible: true },
              { id: 'lastName', visible: true },
              { id: 'dashboards', visible: true },
              { id: 'download', visible: true },
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
