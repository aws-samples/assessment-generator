import { ContentLayout, Container, Header, Box, SpaceBetween } from '@cloudscape-design/components';
import Dashboard from '../components/Dashboard';

export default () => {
  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">My Dashboard</Header>
          </SpaceBetween>
        }
      >
        <Box padding="xxxl">
          <SpaceBetween size="l" alignItems="center">
            <Dashboard />
          </SpaceBetween>
        </Box>
      </Container>
    </ContentLayout>
  );
};
