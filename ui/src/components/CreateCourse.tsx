import { useState, useContext } from 'react';
import { Container, SpaceBetween, Button, Form, FormField, Box, Input } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { upsertCourse } from '../graphql/mutations';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

type CreateCourseProps = {
  onSubmit: () => void;
  onCancel: () => void;
};

export default (props: CreateCourseProps) => {
  const dispatchAlert = useContext(DispatchAlertContext);
  const { onSubmit, onCancel } = props;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        client
          .graphql<any>({
            query: upsertCourse,
            variables: { input: { name, description } },
          })
          .then(() => {
            dispatchAlert({ type: AlertType.SUCCESS, content: 'Course created successfully' });
            onSubmit();
          })
          .catch(() => {
            dispatchAlert({ type: AlertType.ERROR });
            onCancel();
          });
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary">Submit</Button>
          </SpaceBetween>
        }
      >
        <Container>
          <Box padding="xxxl">
            <SpaceBetween direction="horizontal" size="l">
              <FormField label="Name">
                <Input value={name} onChange={(e) => setName(e.detail.value)} />
              </FormField>
              <FormField label="Description">
                <Input value={description} onChange={(e) => setDescription(e.detail.value)} />
              </FormField>
            </SpaceBetween>
          </Box>
        </Container>
      </Form>
    </form>
  );
};
