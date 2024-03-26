import { LineChart, Box, Button } from '@cloudscape-design/components';

export default () => {
  return (
    <LineChart
      series={[
        {
          title: 'Site 1',
          type: 'line',
          data: [
            { x: new Date(2024, 1, 1), y: 58 },
            { x: new Date(2024, 2, 1), y: 10 },
            { x: new Date(2024, 3, 1), y: 10 },
            { x: new Date(2024, 4, 1), y: 94 },
            { x: new Date(2024, 5, 1), y: 12 },
            { x: new Date(2024, 6, 1), y: 15 },
            { x: new Date(2024, 7, 1), y: 19 },
            { x: new Date(2024, 8, 1), y: 16 },
            { x: new Date(2024, 9, 1), y: 27 },
            { x: new Date(2024, 10, 1), y: 26 },
            { x: new Date(2024, 11, 1), y: 28 },
          ],
        },
      ]}
      i18nStrings={{
        xTickFormatter: (e) =>
          e
            .toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: !1,
            })
            .split(',')
            .join('\n'),
        yTickFormatter: function numberFormatter(e) {
          return Math.abs(e) >= 1e9
            ? (e / 1e9).toFixed(1).replace(/\.0$/, '') + 'G'
            : Math.abs(e) >= 1e6
            ? (e / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
            : Math.abs(e) >= 1e3
            ? (e / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
            : e.toFixed(2);
        },
      }}
      ariaLabel="Single data series line chart"
      hideFilter
      hideLegend
      xScaleType="time"
      xTitle="Time (UTC)"
      yTitle="Performance"
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
