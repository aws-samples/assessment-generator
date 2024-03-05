import React, { useState } from 'react';
import { Container, Header, SpaceBetween, Button, Form, FormField, Box, Select, SelectProps } from '@cloudscape-design/components';

const assessments = ['assessment1', 'assessment2', 'assessment3'].map((value) => ({ value }));

export default () => {
  const [assessment, setAssessment] = useState<SelectProps.Option>(assessments[0]);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary">Submit</Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Edit Assessments</Header>}
      >
        <Container>
          <SpaceBetween size="l" alignItems="center">
            <Box padding="xxxl">
              <SpaceBetween direction="horizontal" size="l">
                <FormField label="Select Assessment">
                  <Select options={assessments} selectedOption={assessment} onChange={({ detail }) => setAssessment(detail.selectedOption)} />
                </FormField>
                <FormField label="Edit Assessment Questions">
                  <Select options={assessments} selectedOption={assessment} onChange={({ detail }) => setAssessment(detail.selectedOption)} />
                </FormField>
                <FormField label="Publish Final Assessment">
                  <Select options={assessments} selectedOption={assessment} onChange={({ detail }) => setAssessment(detail.selectedOption)} />
                </FormField>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
};
