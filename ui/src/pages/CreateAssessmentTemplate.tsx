import React, { useState } from 'react';
import { Container, Header, SpaceBetween, Button, Form, FormField, Input, Select, SelectProps, Box } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { Lang, AssessType } from '../graphql/API';
import { createAssessTemplate } from '../graphql/mutations';
import { optionise } from '../helpers';

const client = generateClient();

const langs = Object.values(Lang).map(optionise);
const assessTypes = Object.values(AssessType).map(optionise);

export default () => {
  const [docLang, setDocLang] = useState<SelectProps.Option | null>(null);
  const [assessType, setAssessType] = useState<SelectProps.Option | null>(null);
  const [totalQuestions, setTotalQuestions] = useState('');
  const [easyQuestions, setEasyQuestions] = useState('');
  const [mediumQuestions, setMediumQuestions] = useState('');
  const [hardQuestions, setHardQuestions] = useState('');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await client.graphql({
          query: createAssessTemplate,
          variables: {
            input: {
              docLang: docLang?.value as Lang,
              assessType: assessType?.value as AssessType,
              totalQuestions: +totalQuestions,
              easyQuestions: +easyQuestions,
              mediumQuestions: +mediumQuestions,
              hardQuestions: +hardQuestions,
            },
          },
        });
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary" disabled={!docLang || !assessType || !totalQuestions || !easyQuestions || !mediumQuestions || !hardQuestions}>
              Submit
            </Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Create Assessment Template</Header>}
      >
        <Container>
          <SpaceBetween size="l" alignItems="center">
            <Box padding="xxxl">
              <SpaceBetween direction="horizontal" size="l">
                <FormField label="Document Language">
                  <Select options={langs} selectedOption={docLang} onChange={({ detail }) => setDocLang(detail.selectedOption)} />
                </FormField>
                <FormField label="Default Assessment Type">
                  <Select options={assessTypes} selectedOption={assessType} onChange={({ detail }) => setAssessType(detail.selectedOption)} />
                </FormField>
                <FormField label="Number of Questions">
                  <Input value={totalQuestions} onChange={({ detail }) => setTotalQuestions(detail.value)} />
                </FormField>
                <FormField label="Number of Easy Questions">
                  <Input value={easyQuestions} onChange={({ detail }) => setEasyQuestions(detail.value)} />
                </FormField>
                <FormField label="Number of Medium Questions">
                  <Input value={mediumQuestions} onChange={({ detail }) => setMediumQuestions(detail.value)} />
                </FormField>
                <FormField label="Number of Hard Questions">
                  <Input value={hardQuestions} onChange={({ detail }) => setHardQuestions(detail.value)} />
                </FormField>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
};
