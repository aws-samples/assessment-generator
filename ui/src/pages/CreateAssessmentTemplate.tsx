import React, { useState } from 'react';
import { Container, Header, SpaceBetween, Button, Form, FormField, Input, Select, SelectProps, Box } from '@cloudscape-design/components';

const languages = ['en', 'fr', 'es'].map((lang) => ({ value: lang }));
const assessTypes = ['type1', 'type2', 'type3'].map((lang) => ({ value: lang }));

export default () => {
  const [docLanguage, setDocLanguage] = useState<SelectProps.Option>(languages[0]);
  const [assessType, setAssessType] = useState<SelectProps.Option>(assessTypes[0]);
  const [noOfQuestions, setNoOfQuestions] = useState('');

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
        header={<Header variant="h1">Create Assessment Template</Header>}
      >
        <Container>
          <SpaceBetween size="l" alignItems="center">
            <Box padding="xxxl">
              <SpaceBetween direction="horizontal" size="l">
                <FormField label="Document Language">
                  <Select options={languages} selectedOption={docLanguage} onChange={({ detail }) => setDocLanguage(detail.selectedOption)} />
                </FormField>
                <FormField label="Default Assessment Type">
                  <Select options={assessTypes} selectedOption={assessType} onChange={({ detail }) => setAssessType(detail.selectedOption)} />
                </FormField>
                <FormField label="Number of Questions">
                  <Input value={noOfQuestions} onChange={({ detail }) => setNoOfQuestions(detail.value)} />
                </FormField>
                <FormField label="Number of Hard/Easy/Medium Questions">
                  <Input value={noOfQuestions} onChange={({ detail }) => setNoOfQuestions(detail.value)} />
                </FormField>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
};
