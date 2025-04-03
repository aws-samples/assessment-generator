import { useState, useEffect, useContext } from 'react';
import {
  Table,
  Header,
  SpaceBetween,
  Container,
  ContentLayout,
  Link,
  Box,
  Button,
  Pagination,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { listAssessments, publishAssessment } from '../graphql/queries';
import { Assessment, AssessStatus } from '../graphql/API';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { deleteAssessments } from "../graphql/mutations.ts";

const client = generateClient();

export default () => {
  const navigate = useNavigate();

  const dispatchAlert = useContext(DispatchAlertContext);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const getAssessments = () => {
    client
      .graphql<any>({ query: listAssessments })
      .then(({ data }) => setAssessments(data.listAssessments || []))
      .catch(() => dispatchAlert({ type: AlertType.ERROR }));
  };

  useEffect(getAssessments, []);

  const { items, collectionProps, paginationProps } = useCollection(
    assessments,
    {
      pagination: { pageSize: 25 },
      sorting: {
        defaultState: {
          isDescending: true,
          sortingColumn: {
            sortingField: 'updatedAt',
          },
        },
      },
    },
  );

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
          {...collectionProps}
          columnDefinitions={[
            {
              id: 'name',
              header: 'Name',
              cell: (item) => item.name,
            },
            {
              id: 'course',
              header: 'Course',
              cell: (item) => item.course?.name,
            },
            {
              id: 'lectureDate',
              header: 'Lecture Date',
              cell: (item) => new Date(item.lectureDate).toDateString(),
            },
            {
              id: 'deadline',
              header: 'Deadline',
              cell: (item) => new Date(item.deadline).toDateString(),
            },
            {
              id: 'updatedAt',
              header: 'Updated At',
              cell: (item) => `${new Date(item.updatedAt).toDateString()} ${new Date(item.updatedAt).toLocaleTimeString()}`,
              sortingField: 'updatedAt',
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => item.status,
            },
            {
              id: 'edit',
              header: '',
              cell: (item) =>
                item.published || item.status !== AssessStatus.CREATED ? null : (
                  <Link
                    href={`/edit-assessment/${item.id}`}
                    onFollow={(e) => {
                      e.preventDefault();
                      navigate(e.detail.href!);
                    }}
                  >
                    edit
                  </Link>
                ),
            },
            {
              id: 'publish',
              header: '',
              cell: (item) =>
                item.status === AssessStatus.CREATED ? (
                  <Button
                    wrapText={false}
                    disabled={!!item.published}
                    onClick={() =>
                      client
                        .graphql<any>({ query: publishAssessment, variables: { assessmentId: item.id } })
                        .then(() => dispatchAlert({
                          type: AlertType.SUCCESS,
                          content: 'Published successfully to students',
                        }))
                        .then(getAssessments)
                        .catch(() => dispatchAlert({ type: AlertType.ERROR }))
                    }
                  >
                    {item.published ? 'Published' : 'Publish'}
                  </Button>
                ) : null,
            },
            {
              id: 'delete',
              header: '',
              cell: (item) =>
                (item.status === AssessStatus.CREATED || item.status === AssessStatus.FAILED || item.status === AssessStatus.PUBLISHED )? (
                  <Button
                    wrapText={false}
                    onClick={() =>
                      client
                        .graphql<any>({ query: deleteAssessments, variables: { id: item.id } })
                        .then(() => dispatchAlert({
                          type: AlertType.SUCCESS,
                          content: `Deleted successfully ${item.id}`,
                        }))
                        .then(getAssessments)
                        .catch(() => dispatchAlert({ type: AlertType.ERROR,
                          content: `Could not delete ${item.id}` }))
                    }
                  >
                    Delete
                  </Button>
                ) : null,
            },
          ]}
          columnDisplay={[
            { id: 'name', visible: true },
            { id: 'course', visible: true },
            { id: 'lectureDate', visible: false },
            { id: 'deadline', visible: false },
            { id: 'updatedAt', visible: true },
            { id: 'status', visible: true },
            { id: 'edit', visible: true },
            { id: 'publish', visible: true },
            { id: 'delete', visible: true },
          ]}
          items={items}
          pagination={<Pagination {...paginationProps} />}
          loadingText="Loading list"
          trackBy="id"
          empty={
            <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
              Empty
            </Box>
          }
          // filter={<TextFilter filteringPlaceholder="Find resources" filteringText="" />}
          // pagination={<Pagination currentPageIndex={1} pagesCount={1}/>}
        />
      </Container>
    </ContentLayout>
  );
};
