import React from 'react';
import { useOutlet } from 'react-router-dom';
import { ContentLayout, Container, Header, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import { teacherRoutes } from '../routes';

export default () => {
  const outlet = useOutlet();
  if (outlet) return outlet;

  const [, , { path: studentsPath, children: studentsRoutes }] = teacherRoutes;
  const paths = studentsRoutes!.map(({ path }) => path);
  return (
    <ContentLayout>
      <Container
        header={
          <SpaceBetween size="l">
            <Header variant="h1">Students:</Header>
          </SpaceBetween>
        }
      >
        <Box padding="xxxl">
          <SpaceBetween size="l" alignItems="center">
            <SpaceBetween size="l" direction="horizontal">
              {paths?.map((path) => (
                <Button key={`button-${path}`} href={`${studentsPath}/${path}`}>
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
