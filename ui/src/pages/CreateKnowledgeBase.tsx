import React, { useState } from 'react';
import { FileUpload, FormField, SpaceBetween, Box, Header, ContentLayout, Container, Form, Button } from '@cloudscape-design/components';

export default () => {
  const [file, setFile] = React.useState<File[]>([]);
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary" disabled={!file.length}>
              Submit
            </Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Create Knowledge Base</Header>}
      >
        <ContentLayout>
          <Container
            header={
              <SpaceBetween size="l">
                <Header variant="h1">Upload Document:</Header>
              </SpaceBetween>
            }
          >
            <Box padding="xxxl">
              <SpaceBetween size="l" alignItems="start">
                <FormField>
                  <FileUpload
                    onChange={({ detail }) => setFile(detail.value)}
                    value={file}
                    i18nStrings={{
                      uploadButtonText: (e) => (e ? 'Choose files' : 'Choose file'),
                      dropzoneText: (e) => (e ? 'Drop files to upload' : 'Drop file to upload'),
                      removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                      limitShowFewer: 'Show fewer files',
                      limitShowMore: 'Show more files',
                      errorIconAriaLabel: 'Error',
                    }}
                    showFileLastModified
                    showFileSize
                    showFileThumbnail
                    tokenLimit={3}
                  />
                </FormField>
              </SpaceBetween>
            </Box>
          </Container>
        </ContentLayout>
      </Form>
    </form>
  );
};
