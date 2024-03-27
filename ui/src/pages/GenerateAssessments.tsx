import { useState, useContext, useEffect } from 'react';
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
  Input,
  DatePicker,
} from '@cloudscape-design/components';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
// import { useNavigate } from 'react-router-dom';
import { generateAssessment, listCourses } from '../graphql/queries';
import { Course } from '../graphql/API';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';
import { UserProfileContext } from '../contexts/userProfile';

const client = generateClient();

const assessTemplates = ['template1', 'template2', 'template3'].map((temp) => ({ value: temp }));

export default () => {
  // const navigate = useNavigate();
  const dispatchAlert = useContext(DispatchAlertContext);
  const userProfile = useContext(UserProfileContext);

  const [name, setName] = useState('');
  const [lectureDate, setLectureDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [useDefault, setUseDefault] = useState(true);
  const [assessTemplate, setAssessTemplate] = useState<SelectProps.Option | null>(null);
  const [courses, setCourses] = useState<SelectProps.Option[]>([]);
  const [course, setCourse] = useState<SelectProps.Option | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    client.graphql<any>({ query: listCourses }).then(({ data }) => {
      const list = data.listCourses;
      if (!list) return;
      const options = list.map((course: Course) => ({ label: course!.name!, value: course.id }));
      setCourses(options);
    });
  }, []);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const data = files.map((file) => ({
                  key: `Assessments/${userProfile?.userId}/${course?.value}/${file.name}`,
                  file,
                }));
                try {
                  await Promise.all(
                    data.map(({ key, file }) =>
                      uploadData({
                        key,
                        data: file,
                      })
                    )
                  );
                  client.graphql({
                    query: generateAssessment,
                    variables: { input: { name, lectureDate, deadline, courseId: course?.value, locations: data.map(({ key }) => key) } },
                  });
                  dispatchAlert({ type: AlertType.SUCCESS, content: 'Assessment is being generated' });
                } catch (_e) {
                  dispatchAlert({ type: AlertType.ERROR, content: 'Failed to generate Assessment' });
                }
              }}
              variant="primary"
            >
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
                <FormField label="Name">
                  <Input value={name} onChange={({ detail }) => setName(detail.value)} />
                </FormField>
                <FormField label="Select Course">
                  <Select options={courses} selectedOption={course} onChange={({ detail }) => setCourse(detail.selectedOption)} />
                </FormField>
                <FormField label="Lecture Date">
                  <DatePicker onChange={({ detail }) => setLectureDate(detail.value)} value={lectureDate} placeholder="YYYY/MM/DD" />
                </FormField>
                <FormField label="Deadline">
                  <DatePicker onChange={({ detail }) => setDeadline(detail.value)} value={deadline} placeholder="YYYY/MM/DD" />
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
