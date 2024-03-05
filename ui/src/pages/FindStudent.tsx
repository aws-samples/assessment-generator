import React, { useState } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Button, Box, TextFilter, Modal } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';

const classes = [
  { id: '111', firstName: 'John', lastName: 'Johnson', grade: 'A' },
  { id: '222', firstName: 'Mike', lastName: 'Jordan', grade: 'B' },
  { id: '333', firstName: 'Ahmed', lastName: 'Elsenousi', grade: 'C' },
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
                id: 'grade',
                header: 'Grade',
                cell: (item) => item.grade,
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
              { id: 'grade', visible: true },
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
