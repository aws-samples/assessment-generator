import { useOutlet } from 'react-router-dom';
import { ContentLayout, Container, Header, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import { routes } from '../routes';

export default () => {
  const outlet = useOutlet();
  if (outlet) return outlet;

  const [, { path: assessmentsPath, children: assessmentsRoutes }] = routes[0];
  const paths = assessmentsRoutes!.map(({ path }) => path);
  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Assessments:</Header>
          </SpaceBetween>
        }
      >
        <Box padding="xxxl">
          <SpaceBetween size="l" alignItems="center">
            <SpaceBetween size="l" direction="horizontal">
              {paths?.map((path) => (
                <Button key={`button-${path}`} href={`${assessmentsPath}/${path}`}>
                  <Box variant="h2" padding="m">
                    {path}
                  </Box>
                </Button>
              ))}
            </SpaceBetween>
          </SpaceBetween>
        </Box>
      </Container>
    </ContentLayout>
  );
};
