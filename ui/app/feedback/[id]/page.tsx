'use client';

import React, { useEffect, useContext } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createFeedback } from '../../../types/graphql/mutations';
import { getSummary, getFeedback } from '../../../types/graphql/queries';
import { Summary } from '../../../types/API';
import { Container, SpaceBetween, Box, Header, Button, Form, FormField, Tiles, Select, SelectProps } from '@cloudscape-design/components';
import { DispatchAlertContext } from '../../contexts/alerts';
import { Feedback as FeedbackEnum } from '../../../types/main';

const client = generateClient();
type FeedbackProps = { params: { id: string } };

export default function Feedback(props: FeedbackProps) {
  const { id } = props.params;
  const [summary, setSummary] = React.useState<Summary>();
  const [inputs, setInputs] = React.useState<number[]>([]);
  const [input, setInput] = React.useState<number | null>();
  const [comparisonMode, setComparisonMode] = React.useState<boolean>(false);
  const [disable, setDisable] = React.useState<boolean>(false);

  const dispatchAlert = useContext(DispatchAlertContext);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = (await client.graphql({ query: getSummary, variables: { id } })).data.getSummary;
        if (!result) return;
        setSummary(result);
        const comparison = result.contents?.length! > 1;
        setComparisonMode(comparison);
        if (comparison) setInputs(Array.from({ length: result.contents?.length! }, (_, i) => i));
        else setInputs(Object.values(FeedbackEnum).filter(Number.isInteger) as number[]);
      } catch (error) {}
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      const result = (await client.graphql({ query: getFeedback, variables: { summaryid: id } })).data.getFeedback;
      if (!result) return;
      setInput(result.feedback);
      setDisable(true);
    };
    fetchFeedback();
  }, []);

  if (!summary) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        client
          .graphql({
            query: createFeedback,
            variables: { input: { summaryid: id, feedback: input! } },
          })
          .then(() => {
            dispatchAlert({ type: 'success', content: 'Feedback updated successfully' });
            setDisable(true);
          })
          .catch(() => dispatchAlert({ type: 'error', content: 'Something went wrong, try again please' }));
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary" disabled={disable}>
              Submit
            </Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Feedback Collection Form</Header>}
      >
        <SpaceBetween size="l">
          <>
            <Container header={<Header variant="h2">{summary.name}</Header>}>
              <SpaceBetween size="l">
                {summary.contents?.map((content, i) => (
                  <Container header={<Header variant="h2">Summary {comparisonMode ? `- ${i + 1}` : ''}</Header>}>
                    <Box key={content} variant="p">
                      {content}
                    </Box>
                  </Container>
                ))}
              </SpaceBetween>
            </Container>
            <Container header={<Header variant="h2">Feedback</Header>}>
              <FormField label={comparisonMode ? 'Choose Better:' : 'Rate:'}>
                <Tiles
                  columns={4}
                  value={'' + input}
                  onChange={({ detail }) => setInput(+detail.value)}
                  items={inputs.map((val) => ({ label: comparisonMode ? `summary - ${val + 1}` : FeedbackEnum[val], value: '' + val }))}
                />
              </FormField>
            </Container>
          </>
        </SpaceBetween>
      </Form>
    </form>
  );
}
