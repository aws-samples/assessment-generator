import { useState, useEffect, useContext } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Box, Pagination, Button, Modal } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listCourses } from '../graphql/queries';
import { Course } from '../graphql/API';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';
import CreateCourse from '../components/CreateCourse';

const client = generateClient();

export default () => {
  const dispatchAlert = useContext(DispatchAlertContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    client
      .graphql<any>({ query: listCourses })
      .then(({ data }) => setCourses(data.listCourses || []))
      .catch(() => dispatchAlert({ type: AlertType.ERROR }));
  }, [showCreateModal]);

  return (
    <ContentLayout>
      <Modal header="Create New Course" visible={showCreateModal} onDismiss={() => setShowCreateModal(false)}>
        <CreateCourse onSubmit={() => setShowCreateModal(false)} onCancel={() => setShowCreateModal(false)} />
      </Modal>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Courses:</Header>
          </SpaceBetween>
        }
      >
        <Table
          header={
            <Header>
              <Button iconName="add-plus" onClick={() => setShowCreateModal(true)}>
                New Course
              </Button>
            </Header>
          }
          columnDefinitions={[
            {
              id: 'id',
              header: 'Id',
              cell: (item) => item.id,
            },
            {
              id: 'name',
              header: 'Name',
              cell: (item) => item.name,
            },
            {
              id: 'description',
              header: 'Descriptiont',
              cell: (item) => item.description,
            },
          ]}
          columnDisplay={[
            { id: 'id', visible: true },
            { id: 'name', visible: true },
            { id: 'description', visible: true },
          ]}
          items={courses}
          loadingText="Loading list"
          pagination={<Pagination currentPageIndex={1} pagesCount={1} />}
          trackBy="id"
          empty={
            <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
              Empty
            </Box>
          }
          // filter={<TextFilter filteringPlaceholder="Find courses" filteringText="" />}
        />
      </Container>
    </ContentLayout>
  );
};
