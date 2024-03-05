import React from 'react';
import { useOutlet } from 'react-router-dom';
import { ContentLayout, Container, Header, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import { teacherRoutes } from '../routes';
import { titlise } from '../helpers';

type SectionProps = { id: number };

export default (props: SectionProps) => {
  const outlet = useOutlet();
  if (outlet) return outlet;

  const { path: rootPath, children: routes } = teacherRoutes[0].children[props.id];

  const paths = routes!.map(({ path }) => path);
  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">{`${titlise(rootPath)}:`}</Header>
          </SpaceBetween>
        }
      >
        <Box padding="xxxl">
          <SpaceBetween size="l" alignItems="center">
            <SpaceBetween size="l" direction="horizontal">
              {paths?.map((path) => (
                <Button key={`button-${path}`} href={`${rootPath}/${path}`}>
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
