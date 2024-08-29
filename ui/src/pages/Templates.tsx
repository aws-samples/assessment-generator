import { useState, useEffect, useContext } from 'react';
import { Table, Header, SpaceBetween, Container, ContentLayout, Box, Pagination, Button, Modal } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listAssessTemplates } from '../graphql/queries';
import { AssessTemplate } from '../graphql/API';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';
import CreateTemplate from '../components/CreateTemplate';

const client = generateClient();

export default () => {
  const dispatchAlert = useContext(DispatchAlertContext);
  const [templates, setTemplates] = useState<AssessTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    client
      .graphql<any>({ query: listAssessTemplates })
      .then(({ data }) => setTemplates(data.listAssessTemplates || []))
      .catch(() => dispatchAlert({ type: AlertType.ERROR }));
  }, [showCreateModal]);

  return (
    <ContentLayout>
      <Modal header="Create New Template" visible={showCreateModal} onDismiss={() => setShowCreateModal(false)}>
        <CreateTemplate onSubmit={() => setShowCreateModal(false)} onCancel={() => setShowCreateModal(false)} />
      </Modal>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Templates:</Header>
          </SpaceBetween>
        }
      >
        <Table
          header={
            <Header>
              <Button iconName="add-plus" onClick={() => setShowCreateModal(true)}>
                New Template
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
              id: 'docLang',
              header: 'Lang',
              cell: (item) => item.docLang,
            },
            {
              id: 'assessType',
              header: 'Type',
              cell: (item) => item.assessType,
            },
            {
              id: 'taxonomy',
              header: 'Taxonomy',
              cell: (item) => item.taxonomy,
            },
            {
              id: 'easyQuestions',
              header: 'Easy',
              cell: (item) => item.easyQuestions,
            },
            {
              id: 'mediumQuestions',
              header: 'Medium',
              cell: (item) => item.mediumQuestions,
            },
            {
              id: 'hardQuestions',
              header: 'Hard',
              cell: (item) => item.hardQuestions,
            },
            {
              id: 'totalQuestions',
              header: 'Total',
              cell: (item) => item.totalQuestions,
            },
            {
              id: 'createdAt',
              header: 'CreatedAt',
              cell: (item) => item.createdAt,
            },
          ]}
          columnDisplay={[
            { id: 'name', visible: true },
            { id: 'docLang', visible: true },
            { id: 'assessType', visible: true },
            { id: 'taxonomy', visible: true },
            { id: 'totalQuestions', visible: true },
            { id: 'easyQuestions', visible: true },
            { id: 'mediumQuestions', visible: true },
            { id: 'hardQuestions', visible: true },
            { id: 'createdAt', visible: true },
          ]}
          items={templates}
          loadingText="Loading list"
          pagination={<Pagination currentPageIndex={1} pagesCount={1} />}
          trackBy="id"
          empty={
            <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
              Empty
            </Box>
          }
        />
      </Container>
    </ContentLayout>
  );
};
