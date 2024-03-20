import React, { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, TextFilter, Modal } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';
import { generateClient } from 'aws-amplify/api';
import { listStudents } from '../graphql/queries';
import { Student } from '../graphql/API';

const client = generateClient();

export default () => {
  const [showDashboard, setShowDashboard] = React.useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    (async () => {
      const list: any = (await client.graphql({ query: listStudents })).data.listStudents || [];
      setStudents(list);
    })();
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
              <Header variant="h1">Find Student:</Header>
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
                cell: (item) => <Button onClick={() => setShowDashboard(true)}>Generate Dashboard</Button>,
              },
              {
                id: 'download',
                header: 'Downloads',
                cell: (item) => <Button iconName="download">Download Data</Button>,
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
            filter={<TextFilter filteringPlaceholder="Find resources" filteringText="" />}
          />
        </Container>
      </ContentLayout>
    </>
  );
};
