import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Form,
  FormField,
  Box,
  Select,
  SelectProps,
  Checkbox,
  FileUpload,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

const assessTemplates = ['template1', 'template2', 'template3'].map((temp) => ({ value: temp }));
const coarses = ['biology', 'chemistry', 'maths'].map((temp) => ({ value: temp }));

export default () => {
  const navigate = useNavigate();
  const [useDefault, setUseDefault] = useState(true);
  const [assessTemplate, setAssessTemplate] = useState<SelectProps.Option | null>(null);
  const [coarse, setCoarse] = useState<SelectProps.Option | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button onClick={() => navigate('/edit-assessment/111')} variant="primary">
              Generate Assessment
            </Button>
          </SpaceBetween>
        }
        header={<Header variant="h1">Generate Assessments</Header>}
      >
        <Container header={<Header variant="h1">Generate Assessments</Header>}>
          <SpaceBetween size="l" alignItems="center">
            <Box padding="xxxl">
              <SpaceBetween size="xxl" direction="horizontal">
                <FormField label="Select Assessment Template">
                  <SpaceBetween size="l" direction="horizontal" alignItems="center">
                    <Checkbox checked={useDefault} onChange={({ detail }) => setUseDefault(detail.checked)}>
                      Use Default
                    </Checkbox>
                    <Select
                      options={assessTemplates}
                      selectedOption={assessTemplate}
                      onChange={({ detail }) => setAssessTemplate(detail.selectedOption)}
                      disabled={useDefault}
                    />
                  </SpaceBetween>
                </FormField>
                <FormField label="Select Coarse">
                  <Select options={coarses} selectedOption={coarse} onChange={({ detail }) => setCoarse(detail.selectedOption)} />
                </FormField>
                <FormField label="Add Lecture Notes">
                  <FileUpload
                    multiple
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
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
};
