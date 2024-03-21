import React, { useState, useEffect } from 'react';
import {
  Select,
  FileUpload,
  FormField,
  SpaceBetween,
  Box,
  Header,
  ContentLayout,
  Container,
  Form,
  Button,
  SelectProps,
} from '@cloudscape-design/components';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { listCoarses } from '../graphql/queries';
import { optionise } from '../helpers';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

export default () => {
  const dispatchAlert = React.useContext(DispatchAlertContext);

  const [files, setFiles] = React.useState<File[]>([]);
  const [coarses, setCoarses] = useState<SelectProps.Option[]>([]);
  const [coarse, setCoarse] = useState<SelectProps.Option | null>(null);

  useEffect(() => {
    client.graphql({ query: listCoarses }).then(({ data }) => {
      const list = data.listCoarses;
      if (!list) return;
      const options = list.map((coarse) => optionise(coarse!.name!));
      setCoarses(options);
    });
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const [file] = files;
        const { result } = uploadData({
          key: `${coarse?.value}-${file.name}`,
          data: file,
        });
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary" disabled={!coarse || !files.length}>
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
              <SpaceBetween size="l" direction="horizontal" alignItems="end">
                <FormField label="Choose Coarse:">
                  <Select options={coarses} selectedOption={coarse} onChange={({ detail }) => setCoarse(detail.selectedOption)} />
                </FormField>
                <FormField>
                  <FileUpload
                    onChange={({ detail }) => setFiles(detail.value)}
                    value={files}
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
