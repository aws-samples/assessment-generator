'use client';

import React, { useEffect, useContext } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createFeedback } from '../../types/graphql/mutations';
import { listSummaries, getSummary, getFeedback } from '../../types/graphql/queries';
import { Summary } from '../../types/API';
import { Container, SpaceBetween, Box, Header, Button, Form, FormField, Tiles, Select, SelectProps } from '@cloudscape-design/components';
import { DispatchAlertContext } from '../contexts/alerts';

const ratingValues = ['bad', 'neutral', 'good', 'excellent'];

const client = generateClient();

export default function Home() {
  const [feedback, setFeedback] = React.useState<number | null>(null);
  const [selectedSummary, setSelectedSummary] = React.useState<SelectProps.Option | null>(null);
  const [summaries, setSummaries] = React.useState<Summary[]>([]);
  const [summary, setSummary] = React.useState<Summary>();

  const dispatchAlert = useContext(DispatchAlertContext);

  useEffect(() => {
    const fetchSummary = async () => {
      const result = (await client.graphql({ query: getSummary, variables: { id: selectedSummary?.value } })).data.getSummary;
      setSummary(result as any);
    };
    fetchSummary();

    const fetchFeedback = async () => {
      try {
        const result = (await client.graphql({ query: getFeedback, variables: { summaryid: selectedSummary?.value } })).data.getFeedback;
        setFeedback(result?.feedback!);
      } catch (error) {}
    };
    fetchFeedback();
  }, [selectedSummary]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const result = (await client.graphql({ query: listSummaries })).data.listSummaries;
      setSummaries((result || []) as any);
    };
    fetchSummaries();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        client
          .graphql({
            query: createFeedback,
            variables: { input: { summaryid: summary?.id!, feedback: feedback! } },
          })
          .then(() => dispatchAlert({ type: 'success', content: 'Feedback updated successfully' }))
          .catch(() => dispatchAlert({ type: 'error', content: 'Something went wrong, try again please' }));
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary" disabled={!selectedSummary}>
              Submit
            </Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Feedback Collection Form</Header>}
      >
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Select Summary:</Header>}>
            <Select
              selectedOption={selectedSummary}
              options={summaries.map((summary) => ({ label: summary.name!, value: summary.id }))}
              onChange={({ detail }) => setSelectedSummary(detail.selectedOption)}
              filteringType="auto"
            />
          </Container>
          {summary && (
            <>
              <Container header={<Header variant="h2">Summary</Header>}>
                <SpaceBetween size="l">
                  {summary.contents?.map((content) => (
                    <Box key={content} variant="p">
                      {content}
                    </Box>
                  ))}
                </SpaceBetween>
              </Container>
              <Container header={<Header variant="h2">Rate</Header>}>
                <FormField label="Choose">
                  <Tiles
                    columns={4}
                    value={'' + feedback}
                    onChange={({ detail }) => setFeedback(+detail.value)}
                    items={ratingValues.map((val, i) => ({ label: val, value: '' + i }))}
                  />
                </FormField>
              </Container>
            </>
          )}
        </SpaceBetween>
      </Form>
    </form>
  );
}
