import { useState, useEffect } from 'react';
import { Wizard, Container, Header, SpaceBetween, Box, Tiles } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { StudentAssessment } from '../graphql/API';
import { getStudentAssessment } from '../graphql/queries';

const client = generateClient();

export default () => {
  const params = useParams();
  const navigate = useNavigate();

  const [studentAssessment, setStudentAssessment] = useState<StudentAssessment>();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    client
      .graphql<any>({ query: getStudentAssessment, variables: { parentAssessId: params.id! } })
      .then(({ data }) => {
        const result = data.getStudentAssessment;
        if (!result) throw new Error();
        setStudentAssessment(result);
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
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Finish',
        optional: 'optional',
      }}
      onNavigate={({ detail }) => {
        setActiveStepIndex(detail.requestedStepIndex);
      }}
      activeStepIndex={activeStepIndex}
      allowSkipTo
      steps={studentAssessment.assessment.questions.map(({ title, question, answers, correctAnswer, explanation }) => ({
        title,
        content: (
          <SpaceBetween size="l">
            <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
              <Box variant="p">{question}</Box>
            </Container>
            <Container header={<Header variant="h2">Answer</Header>}>
              <SpaceBetween size="l">
                {answers.map((answer, i) => (
                  <div
                    style={{
                      border:
                        correctAnswer === i
                          ? `3px solid green`
                          : studentAssessment.chosenAnswers![activeStepIndex] === i &&
                            studentAssessment.chosenAnswers![activeStepIndex] !== correctAnswer
                          ? `3px solid red`
                          : '',
                    }}
                  >
                    <Container>
                      <Box variant="p">{answer}</Box>
                    </Container>
                  </div>
                ))}
              </SpaceBetween>
            </Container>
            <Container header={<Header variant="h2">Explanation</Header>}>
              <Box variant="p">{explanation}</Box>
            </Container>
          </SpaceBetween>
        ),
      }))}
    />
  );
};
