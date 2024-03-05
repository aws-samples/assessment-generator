import React, { useState } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, TextFilter, Modal } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';

const classes = [
  { id: '111', name: 'classA', subject: 'chemistry', students: 5 },
  { id: '222', name: 'classB', subject: 'biology', students: 9 },
  { id: '333', name: 'classC', subject: 'maths', students: 3 },
];

export default () => {
  const [showDashboard, setShowDashboard] = React.useState(false);

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
                id: 'id',
                header: 'Id',
                cell: (item) => item.id,
                sortingField: 'id',
                isRowHeader: true,
              },
              {
                id: 'name',
                header: 'Name',
                cell: (item) => item.name,
              },
              {
                id: 'subject',
                header: 'Subject',
                cell: (item) => item.subject,
              },
              {
                id: 'students',
                header: 'Students',
                cell: (item) => item.students,
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
              { id: 'name', visible: true },
              { id: 'subject', visible: true },
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
