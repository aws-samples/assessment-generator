import { useOutlet } from 'react-router-dom';
import { ContentLayout, Container, Header, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import { routes } from '../routes';
import { titlise } from '../helpers';

type HomePageProps = {
  route: number;
};

export default (props: HomePageProps) => {
  const outlet = useOutlet();
  if (outlet) return outlet;

  const [{ path: rootPath, children: childRoutes }] = (routes as any)[props.route];
  const paths = childRoutes!.map(({ path }: any) => path);

  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Home Page</Header>
          </SpaceBetween>
        }
      >
        <Box padding="xxxl">
          <SpaceBetween size="l" alignItems="center">
            <SpaceBetween size="l" direction="horizontal">
              {paths?.map((path: any) => (
                <Button key={`button-${path}`} href={`${rootPath}${path}`}>
                  <Box variant="h2" padding="m">
                    {titlise(path)}
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
