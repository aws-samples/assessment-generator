'use client';

import React, { useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getSummary } from '../../../types/graphql/queries';
import { Summary } from '../../../types/API';
import { Container, SpaceBetween, Box, Header, BarChart, PieChart, Tabs } from '@cloudscape-design/components';
import { Feedback } from '../../../types/main';

const client = generateClient();

type SummaryProps = { params: { id: string } };

export default function Summary(props: SummaryProps) {
  const summaryId = props.params.id;
  const [summary, setSummary] = React.useState<Summary>();

  useEffect(() => {
    const fetchSummary = async () => {
      const result = (await client.graphql({ query: getSummary, variables: { id: summaryId } })).data.getSummary;
      setSummary(result as any);
    };
    fetchSummary();
  }, []);

  if (!summary) return null;

  const comparisonMode = summary.contents!.length > 1;

  // noinspection TypeScriptValidateTypes
    return (
    <Container header={<Header variant="h2">{summary.name}</Header>}>
      <SpaceBetween size="l">
        {summary.contents?.map((content, i) => (
          <Container header={<Header variant="h2">Summary {comparisonMode ? `- ${i + 1}` : ''}</Header>}>
            <Box key={content} variant="p">
              {content}
            </Box>
          </Container>
        ))}
        <Container header={<Header variant="h2">Stats:</Header>}>
          <Tabs
            tabs={[
              {
                label: 'Bars',
                id: 'bars',
                content: (
                  <BarChart
                    series={[
                      {
                        title: 'Ratings',
                        type: 'bar',
                        data: summary.stats!.map(({ feedback, count }: any) => ({ x: comparisonMode ? feedback : Feedback[feedback], y: count })),
                      },
                    ]}
                    i18nStrings={{
                      xTickFormatter: (e) => (comparisonMode ? `summary - ${e}` : e),
                    }}
                    fitHeight
                    height={100}
                    hideFilter
                    hideLegend
                    horizontalBars
                    xTitle="Feedback"
                    yTitle="Count"
                  />
                ),
              },
              {
                label: 'Pie',
                id: 'pie',
                content: (
                  <PieChart
                    fitHeight
                    hideFilter
                    data={summary.stats!.map(({ feedback, count }: any) => ({
                      title: comparisonMode ? `summary - ${feedback + 1}` : Feedback[feedback],
                      value: count,
                    }))}
                    segmentDescription={(datum, sum) => `${datum.value} feedbacks, ${((datum.value / sum) * 100).toFixed(0)}%`}
                    // detailPopoverContent={(datum, sum) => [
                    //   { key: 'Resource count', value: datum.value },
                    //   {
                    //     key: 'Percentage',
                    //     value: `${((datum.value / sum) * 100).toFixed(0)}%`,
                    //   },
                    //   { key: 'Last update on', value: datum.lastUpdate },
                    // ]}
                  />
                ),
              },
            ]}
          />
        </Container>
      </SpaceBetween>
    </Container>
  );
}
