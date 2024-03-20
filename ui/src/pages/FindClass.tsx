import React, { useState, useEffect } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, TextFilter, Modal } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';
import { generateClient } from 'aws-amplify/api';
import { listClasses } from '../graphql/queries';
import { Class } from '../graphql/API';

const client = generateClient();

export default () => {
  const [showDashboard, setShowDashboard] = React.useState(false);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    (async () => {
      const list: any = (await client.graphql({ query: listClasses })).data.listClasses || [];
      setClasses(list);
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
              <Header variant="h1">Find Class:</Header>
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
                id: 'students',
                header: 'Students',
                cell: (item) => item.students!.length,
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
              { id: 'name', visible: true },
              { id: 'students', visible: true },
              { id: 'dashboards', visible: true },
              { id: 'download', visible: true },
            ]}
            items={classes}
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
