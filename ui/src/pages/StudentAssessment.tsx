import { useState, useEffect, useContext } from 'react';
import {
  Wizard,
  Container,
  Header,
  SpaceBetween,
  FormField,
  Button,
  Box,
  PieChart,
  Tiles,
  Modal,
  Textarea,
  Spinner,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { MultiChoice, FreeText, AssessType, StudentAssessment } from '../graphql/API';
import { getStudentAssessment } from '../graphql/queries';
import { gradeStudentAssessment } from '../graphql/mutations';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

export default () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatchAlert = useContext(DispatchAlertContext);
  const [showSpinner, setShowSpinner] = useState(false);

  const [assessmentId, setAssessmentId] = useState<string>();
  const [questions, setQuestions] = useState<MultiChoice[] | FreeText[]>([]);
  const [assessType, setAssessType] = useState<AssessType>();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number>();

  useEffect(() => {
    client
      .graphql<any>({ query: getStudentAssessment, variables: { parentAssessId: params.id! } })
      .then(({ data }) => {
        const result: StudentAssessment = data.getStudentAssessment;
        setAssessmentId(result.parentAssessId);
        setAssessType(result.assessment?.assessType);
        setQuestions(result.assessment![result.assessment!.assessType]!);
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
          setShowSpinner(true);
          client
            .graphql<any>({
              query: gradeStudentAssessment,
              variables: {
                input: {
                  parentAssessId: params.id!,
                  answers: JSON.stringify(answers.map((answer) => (isNaN(+answer) ? answer : +answer + 1))),
                },
              },
            })
            .then(({ data }) => {
              const { score } = data.gradeStudentAssessment;
              setScore(score);
            })
            .catch(() => dispatchAlert({ type: AlertType.ERROR }))
            .finally(() => setShowSpinner(false));
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
        steps={questions.map((q) => {
          return {
            title: q.title,
            content: (
              <SpaceBetween size="l">
                <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
                  <Box variant="p">{q.question}</Box>
                </Container>
                <Container header={<Header variant="h2">Answer</Header>}>
                  {assessType === AssessType.freeTextAssessment ? (
                    <FormField label={'Provide:'}>
                      <Textarea
                        value={answers[activeStepIndex]}
                        onChange={({ detail }) => {
                          const newAnswers = [...answers];
                          newAnswers[activeStepIndex] = detail.value;
                          setAnswers(newAnswers);
                        }}
                      />
                    </FormField>
                  ) : (
                    <FormField label={'Choose:'}>
                      <Tiles
                        columns={1}
                        value={answers[activeStepIndex]}
                        items={(q as MultiChoice).answerChoices!.map((answerChoice, i) => ({ label: answerChoice, value: i.toString() }))}
                        onChange={({ detail }) => {
                          const newAnswers = [...answers];
                          newAnswers[activeStepIndex] = detail.value;
                          setAnswers(newAnswers);
                        }}
                      />
                    </FormField>
                  )}
                </Container>
              </SpaceBetween>
            ),
          };
        })}
      />
      <Modal visible={showSpinner} header={<Header>Grading...</Header>}>
        <SpaceBetween size="s" alignItems="center">
          <Spinner size="big" />
        </SpaceBetween>
      </Modal>
    </>
  );
};
