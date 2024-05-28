import { LineChart, Box, Button } from '@cloudscape-design/components';

export type DashboardProps = {
  data: { x: Date; y: number }[];
};

export default (props: DashboardProps) => {
  const { data } = props;

  return (
    <LineChart
      series={[
        {
          title: 'Score',
          type: 'line',
          data,
        },
      ]}
      yDomain={[0, 100]}
      i18nStrings={{
        xTickFormatter: (e) =>
          e
            .toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
            })
            .split(',')
            .join('\n'),
      }}
      ariaLabel="Single data series line chart"
      hideFilter
      hideLegend
      xScaleType="time"
      xTitle="Time (UTC)"
      yTitle="Score %"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
      noMatch={
        <Box textAlign="center" color="inherit">
          <b>No matching data</b>
          <Box variant="p" color="inherit">
            There is no matching data to display
          </Box>
          <Button>Clear filter</Button>
        </Box>
      }
    />
  );
};
