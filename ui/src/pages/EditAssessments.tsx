import { useState, useReducer, useEffect, useContext } from 'react';
import { Wizard, Container, Header, SpaceBetween, Button, Textarea, Tiles } from '@cloudscape-design/components';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { Assessment } from '../graphql/API';
import { getAssessment } from '../graphql/queries';
import { upsertAssessment } from '../graphql/mutations';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';

const client = generateClient();

enum ActionTypes {
  Delete,
  Update,
  Put,
}

const reducer = (state: Assessment, actions: { type: ActionTypes; stepIndex?: number; key?: string; content?: any }) => {
  const { type, stepIndex, key, content } = actions;
  switch (type) {
    case ActionTypes.Put:
      return content;
    case ActionTypes.Delete: {
      // @ts-ignore
      const newQuestions = state.questions?.toSpliced(stepIndex!, 1);
      return { ...state, questions: newQuestions };
    }
    case ActionTypes.Update: {
      const newQuestions = state.questions?.map((section, i) => {
        if (stepIndex !== i) return section;
        const newSection: any = { ...section };
        newSection[key!] = content;
        return newSection;
      });
      return { ...state, questions: newQuestions };
    }
    default:
      throw Error('Unknown Action');
  }
};

export default () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatchAlert = useContext(DispatchAlertContext);

  const [assessment, updateAssessment] = useReducer(reducer, {} as never);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    client
      .graphql<any>({ query: getAssessment, variables: { id: params.id! } })
      .then(({ data }) => {
        const result = data.getAssessment;
        if (!result) throw new Error();
        const { __typename, updatedAt, ...content } = result;
        content.questions = content.questions.map((section: any) => {
          const { __typename, ...newSection } = section;
          return newSection;
        });
        updateAssessment({ type: ActionTypes.Put, content });
      })
      .catch(() => {});
  }, []);

  const steps =
    (assessment as Assessment).questions?.map(({ title, question, answerChoices, correctAnswer, explanation }) => ({
      title,
      content: (
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Edit Question {activeStepIndex + 1}</Header>}>
            <Textarea
              onChange={({ detail }) =>
                updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'question', content: detail.value })
              }
              value={question}
            />
          </Container>
          {answerChoices?.length ? (
            <>
              <Container header={<Header variant="h2">Edit Answers</Header>}>
                <SpaceBetween size="l" direction="horizontal" alignItems="center">
                  {answerChoices?.map((answerChoice, answerIndex) => (
                    <Container
                      key={`answer-${answerIndex}`}
                      header={
                        <Header
                          variant="h2"
                          actions={
                            <Button
                              iconName="close"
                              variant="icon"
                              onClick={() =>
                                updateAssessment({
                                  type: ActionTypes.Update,
                                  stepIndex: activeStepIndex,
                                  key: 'answerChoice',
                                  content: answerChoices.filter((_a, i) => answerIndex !== i),
                                })
                              }
                            />
                          }
                        />
                      }
                    >
                      <Textarea
                        onChange={({ detail }) =>
                          updateAssessment({
                            type: ActionTypes.Update,
                            stepIndex: activeStepIndex,
                            key: 'answerChoice',
                            content: answerChoices?.map((answerChoice, i) => (answerIndex === i ? detail.value : answerChoice)),
                          })
                        }
                        value={answerChoice!}
                      />
                    </Container>
                  ))}
                  <Container>
                    <Button
                      iconName="add-plus"
                      variant="icon"
                      onClick={() =>
                        updateAssessment({
                          type: ActionTypes.Update,
                          stepIndex: activeStepIndex,
                          key: 'answerChoice',
                          content: [...(answerChoices || []), ''],
                        })
                      }
                    />
                  </Container>
                </SpaceBetween>
              </Container>
              <Container header={<Header variant="h2">Choose Correct Answer</Header>}>
                <Tiles
                  value={(correctAnswer! - 1).toString()}
                  items={answerChoices?.map((answerChoice, i) => ({ label: answerChoice, value: i.toString() }))}
                  onChange={({ detail }) =>
                    updateAssessment({
                      type: ActionTypes.Update,
                      stepIndex: activeStepIndex,
                      key: 'correctAnswer',
                      content: +detail.value + 1,
                    })
                  }
                />
              </Container>
            </>
          ) : null}
          <Container header={<Header variant="h2">Explanation</Header>}>
            <Textarea
              onChange={({ detail }) =>
                updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'explanation', content: detail.value })
              }
              value={explanation}
            />
          </Container>
        </SpaceBetween>
      ),
    })) || [];

  return (
    <Wizard
      onSubmit={() => {
        const { course, ...inputAssessment } = assessment;
        client
          .graphql<any>({ query: upsertAssessment, variables: { input: inputAssessment } })
          .then(() => dispatchAlert({ type: AlertType.SUCCESS, content: 'Assessment updated successfully' }))
          .then(() => navigate('/assessments/find-assessments'))
          .catch(() => dispatchAlert({ type: AlertType.ERROR }));
      }}
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Question ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) => `Question ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step, _stepNumber) => `Skip to ${step.title}`,
        cancelButton: 'Delete this Question',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Submit',
        optional: 'optional',
      }}
      onCancel={() => updateAssessment({ type: ActionTypes.Delete, stepIndex: activeStepIndex })}
      onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
      activeStepIndex={activeStepIndex}
      steps={steps}
    />
  );
};
