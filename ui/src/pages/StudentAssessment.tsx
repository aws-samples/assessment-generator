import { useState, useEffect, useContext } from 'react';
import { Wizard, Container, Header, SpaceBetween, FormField, Button, Box, PieChart, Tiles, Modal } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { QandA } from '../graphql/API';
import { getStudentAssessment } from '../graphql/queries';
import { upsertStudentAssessment } from '../graphql/mutations';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

export default () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatchAlert = useContext(DispatchAlertContext);

  const [assessmentId, setAssessmentId] = useState<string>();
  const [questions, setQuestions] = useState<QandA[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [chosenAnswers, setChosenAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number>();

  useEffect(() => {
    client
      .graphql<any>({ query: getStudentAssessment, variables: { parentAssessId: params.id! } })
      .then(({ data }) => {
        const result = data.getStudentAssessment;
        if (!result?.assessment?.questions) throw new Error();
        setAssessmentId(result.parentAssessId);
        setQuestions(result.assessment.questions);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Modal
        visible={score !== undefined}
        header="Your Score:"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={() => navigate('/assessments')}>
              Done
            </Button>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <PieChart
            hideFilter
            hideLegend
            variant="donut"
            data={[
              { title: 'Correct', value: score! },
              { title: 'Incorrect', value: 100 - score! },
            ]}
            innerMetricValue={`${score}%`}
          />
          <Button fullWidth onClick={() => navigate('/review/' + assessmentId)}>
            Review
          </Button>
        </SpaceBetween>
      </Modal>
      <Wizard
        onSubmit={() => {
          const calculatedScore = Math.round(
            (questions.reduce((correct, q, i) => (q.correctAnswer === (+chosenAnswers[i]+1) ? correct + 1 : correct), 0) * 100) / questions.length
          );
          client
            .graphql<any>({
              query: upsertStudentAssessment,
              variables: {
                input: {
                  parentAssessId: params.id!,
                  score: calculatedScore,
                  chosenAnswers: chosenAnswers.map((chosenAnswer) => {
                    return +chosenAnswer+1;
                  }),
                  completed: true,
                },
              },
            })
            .then(() => setScore(calculatedScore))
            .catch(() => dispatchAlert({ type: AlertType.ERROR }));
        }}
        i18nStrings={{
          stepNumberLabel: (stepNumber) => `Question ${stepNumber}`,
          collapsedStepsLabel: (stepNumber, stepsCount) => `Question ${stepNumber} of ${stepsCount}`,
          skipToButtonLabel: (step, _stepNumber) => `Skip to ${step.title}`,
          cancelButton: 'Cancel',
          previousButton: 'Previous',
          nextButton: 'Next',
          submitButton: 'Submit',
          optional: 'optional',
        }}
        onCancel={() => navigate('/assessments')}
        onNavigate={({ detail }) => {
          setActiveStepIndex(detail.requestedStepIndex);
        }}
        activeStepIndex={activeStepIndex}
        allowSkipTo
        steps={questions.map(({ title, question, answers }) => ({
          title,
          content: (
            <SpaceBetween size="l">
              <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
                <Box variant="p">{question}</Box>
              </Container>
              <Container header={<Header variant="h2">Answer</Header>}>
                <FormField label={'Choose:'}>
                  <Tiles
                    columns={1}
                    value={chosenAnswers[activeStepIndex]}
                    items={answers.map((answer, i) => ({ label: answer, value: i.toString() }))}
                    onChange={({ detail }) => {
                      const newAnswers = [...chosenAnswers];
                      newAnswers[activeStepIndex] = detail.value;
                      setChosenAnswers(newAnswers);
                    }}
                  />
                </FormField>
              </Container>
            </SpaceBetween>
          ),
        }))}
      />
    </>
  );
};
