import { useState } from 'react';
import { Container, Header, SpaceBetween, Button, Form, FormField, Box, Select, SelectProps } from '@cloudscape-design/components';

const assessments = ['assessment1', 'assessment2', 'assessment3'].map((value) => ({ value }));
const classes = ['class1', 'class2', 'class3'].map((value) => ({ value }));

export default () => {
  const [assessment, setAssessment] = useState<SelectProps.Option | null>(null);
  const [chosenClass, setChosenClass] = useState<SelectProps.Option | null>(null);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary">Send Assessment</Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Send Assessments</Header>}
      >
        <Container>
          <SpaceBetween size="l" alignItems="center">
            <Box padding="xxxl">
              <SpaceBetween direction="horizontal" size="xxl">
                <FormField label="Select Assessment">
                  <Select options={assessments} selectedOption={assessment} onChange={({ detail }) => setAssessment(detail.selectedOption)} />
                </FormField>
                <FormField label="Select Class">
                  <Select options={classes} selectedOption={chosenClass} onChange={({ detail }) => setChosenClass(detail.selectedOption)} />
                </FormField>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
};
