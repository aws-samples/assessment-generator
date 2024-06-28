import { useState, useEffect } from 'react';
import { Wizard, Container, Header, SpaceBetween, Box } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { StudentAssessment as RawStudentAssessment } from '../graphql/API';
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
      steps={studentAssessment.assessment.questions.map(({ title, question, answerChoices, correctAnswer, explanation }) => ({
        title,
        content: (
          <SpaceBetween size="l">
            <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
              <Box variant="p">{question}</Box>
            </Container>
            <Container header={<Header variant="h2">Answer</Header>}>
              <SpaceBetween size="l">
                {answerChoices ? (
                  answerChoices?.map((answerChoice, i) => (
                    <div
                      style={{
                        border:
                          correctAnswer! - 1 === i
                            ? `3px solid green`
                            : studentAssessment.answers![activeStepIndex] === i + 1 && studentAssessment.answers![activeStepIndex] !== correctAnswer
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
                  <Box variant="p">{studentAssessment.answers[activeStepIndex]}</Box>
                )}
              </SpaceBetween>
            </Container>
            {JSON.parse(studentAssessment.analyses || '{}')[activeStepIndex] ? (
              <Container header={<Header variant="h2">Grade - {JSON.parse(studentAssessment.analyses!)[activeStepIndex].rate}%</Header>}>
                <Box variant="p">{JSON.parse(studentAssessment.analyses!)[activeStepIndex].analysis}</Box>
              </Container>
            ) : (
              <Container header={<Header variant="h2">Explanation</Header>}>
                <Box variant="p">{explanation}</Box>
              </Container>
            )}
          </SpaceBetween>
        ),
      }))}
    />
  );
};
