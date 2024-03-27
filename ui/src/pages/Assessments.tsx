import { useContext } from 'react';
import { useOutlet } from 'react-router-dom';
import { ContentLayout, Container, Header, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import { routes } from '../routes';
import { UserProfileContext } from '../contexts/userProfile';

export default () => {
  const outlet = useOutlet();
  if (outlet) return outlet;

  const userProfile = useContext(UserProfileContext);

  const [, { path: assessmentsPath, children: assessmentsRoutes }] = (routes as any)[userProfile?.group!];
  const paths = assessmentsRoutes!.map(({ path }: any) => path);

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
              {paths?.map((path: any) => (
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
