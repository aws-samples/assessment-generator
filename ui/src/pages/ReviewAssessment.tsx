import { useState, useEffect } from 'react';
import { Wizard, Container, Header, SpaceBetween, Box, Table } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { StudentAssessment as RawStudentAssessment, AssessType, MultiChoice } from '../graphql/API';
import { getStudentAssessment } from '../graphql/queries';

const client = generateClient();

type StudentAssessment = Omit<RawStudentAssessment, 'answers'> & { answers: [string | number] };

export default () => {
  const params = useParams();
  const navigate = useNavigate();

  const [studentAssessment, setStudentAssessment] = useState<StudentAssessment>();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    client
      .graphql<any>({ query: getStudentAssessment, variables: { parentAssessId: params.id! } })
      .then(({ data }) => {
        const result: RawStudentAssessment = data.getStudentAssessment;
        if (!result) throw new Error();
        const parsedResult: StudentAssessment = { ...result, answers: JSON.parse(result.answers) };
        setStudentAssessment(parsedResult);
      })
      .catch(() => {});
  }, []);

  if (!studentAssessment?.assessment) return null;

  const assessType = studentAssessment.assessment.assessType;

  return (
    <Wizard
      onSubmit={() => navigate('/assessments')}
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Question ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) => `Question ${stepNumber} of ${stepsCount}`,
        cancelButton: 'Cancel',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Finish',
        optional: 'optional',
      }}
      onCancel={() => navigate('/assessments')}
      onNavigate={({ detail }) => {
        setActiveStepIndex(detail.requestedStepIndex);
      }}
      activeStepIndex={activeStepIndex}
      allowSkipTo
      steps={
        studentAssessment.assessment[assessType]?.map((assessment) => ({
          title: assessment.title,
          content: (
            <SpaceBetween size="l">
              <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
                <Box variant="p">{assessment.question}</Box>
              </Container>
              <Container header={<Header variant="h2">Answer</Header>}>
                <SpaceBetween size="l">
                  {assessType === AssessType.multiChoiceAssessment ? (
                    (assessment as MultiChoice).answerChoices.map((answerChoice, i) => (
                      <div
                        style={{
                          border:
                            (assessment as MultiChoice).correctAnswer! - 1 === i
                              ? `3px solid green`
                              : studentAssessment.answers![activeStepIndex] === i + 1 &&
                                studentAssessment.answers![activeStepIndex] !== (assessment as MultiChoice).correctAnswer
                              ? `3px solid red`
                              : '',
                        }}
                      >
                        <Container>
                          <Box variant="p">{answerChoice}</Box>
                        </Container>
                      </div>
                    ))
                  ) : (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{studentAssessment.answers[activeStepIndex]}</p>
                  )}
                </SpaceBetween>
              </Container>
              {JSON.parse(studentAssessment.report || '{}')[activeStepIndex] ? (
                <>
                  <Container header={<Header variant="h2">Rubric</Header>}>
                    <Table
                      columnDefinitions={[
                        {
                          id: 'weight',
                          header: 'Weight',
                          cell: (item) => item.weight,
                        },
                        {
                          id: 'point',
                          header: 'Point',
                          cell: (item) => item.point,
                        },
                      ]}
                      items={studentAssessment.assessment!.freeTextAssessment![activeStepIndex].rubric}
                    />
                  </Container>
                  <Container header={<Header variant="h2">Points - {JSON.parse(studentAssessment.report!)[activeStepIndex].rate}</Header>}>
                    <Box variant="p">{JSON.parse(studentAssessment.report!)[activeStepIndex].explanation}</Box>
                  </Container>
                </>
              ) : (
                <Container header={<Header variant="h2">Explanation</Header>}>
                  <Box variant="p">{(assessment as MultiChoice).explanation}</Box>
                </Container>
              )}
            </SpaceBetween>
          ),
        })) || []
      }
    />
  );
};
