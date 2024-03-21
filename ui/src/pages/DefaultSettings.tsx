import React, { useEffect, useState, useContext } from 'react';
import { Container, Header, SpaceBetween, Button, Form, FormField, Box, Select, SelectProps } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { Lang, AssessType } from '../graphql/API';
import { getSettings } from '../graphql/queries';
import { upsertSettings } from '../graphql/mutations';
import { optionise } from '../helpers';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

const langs = Object.values(Lang).map(optionise);
const assessTypes = Object.values(AssessType).map(optionise);

export default () => {
  const dispatchAlert = useContext(DispatchAlertContext);

  const [uiLang, setUiLang] = useState<SelectProps.Option | null>(null);
  const [docLang, setDocLang] = useState<SelectProps.Option | null>(null);
  const [assessType, setAssessType] = useState<SelectProps.Option | null>(null);

  useEffect(() => {
    client.graphql({ query: getSettings }).then(({ data }) => {
      const settings = data.getSettings;
      if (!settings) return;
      setUiLang(optionise(settings.uiLang!));
      setDocLang(optionise(settings.docLang!));
      setAssessType(optionise(settings.assessType!));
    });
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        client
          .graphql({
            query: upsertSettings,
            variables: { input: { uiLang: uiLang?.value as Lang, docLang: docLang?.value as Lang, assessType: assessType?.value as AssessType } },
          })
          .then(() => dispatchAlert({ type: AlertType.SUCCESS, content: 'Settings updated successfully' }))
          .catch(() => dispatchAlert({ type: AlertType.ERROR }));
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary">Submit</Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Default Settings</Header>}
      >
        <Container>
          <Box padding="xxxl">
            <SpaceBetween direction="horizontal" size="l">
              <FormField label="UI Language">
                <Select options={langs} selectedOption={uiLang} onChange={({ detail }) => setUiLang(detail.selectedOption)} />
              </FormField>
              <FormField label="Document Language">
                <Select options={langs} selectedOption={docLang} onChange={({ detail }) => setDocLang(detail.selectedOption)} />
              </FormField>
              <FormField label="Default Assessment Type">
                <Select options={assessTypes} selectedOption={assessType} onChange={({ detail }) => setAssessType(detail.selectedOption)} />
              </FormField>
            </SpaceBetween>
          </Box>
        </Container>
      </Form>
    </form>
  );
};
