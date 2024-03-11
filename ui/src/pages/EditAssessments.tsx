import React, { useState, useReducer } from 'react';
import { Wizard, Container, Link, Header, SpaceBetween, FormField, Input, Button, Box, Textarea, Tiles } from '@cloudscape-design/components';

const fixtures = [
  { title: 'Algebra', question: 'Solve for x in the equation 3x + 4 = 19', answers: ['5', '4', '3', '6'] },
  {
    title: 'Geometry',
    question: 'A rectangle has a length of 8 cm and a width of 3 cm. What is the area of the rectangle?',
    answers: ['11 cm2', '24 cm2', '22 cm2', '14 cm2'],
  },
  {
    title: 'Statistics',
    question: 'A dataset contains the following five numbers: 2, 4, 6, 8, 10. What is the mean (average) of this dataset?',
    answers: ['5', '6', '7', '8'],
  },
];

enum ActionTypes {
  Delete,
  Update,
}

const reducer = (state: typeof fixtures, actions: { type: ActionTypes; stepIndex: number; key?: string; content?: string }) => {
  const { type, stepIndex, key, content } = actions;
  let newState;
  switch (type) {
    case ActionTypes.Delete:
      newState = state.toSpliced(stepIndex, 1);
      break;
    case ActionTypes.Update:
      newState = state.map((section, i) => {
        if (stepIndex !== i) return section;
        const newSection: any = { ...section };
        newSection[key!] = content;
        return newSection;
      });
      break;
    default:
      throw Error('Unknown Action');
  }
  return newState;
};

export default () => {
  const [assessments, updateAssessment] = useReducer(reducer, fixtures);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [tile, setTile] = useState('');

  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Question ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) => `Question ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step, stepNumber) => `Skip to ${step.title}`,
        cancelButton: 'Delete this Question',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Submit',
        optional: 'optional',
      }}
      onCancel={() => updateAssessment({ type: ActionTypes.Delete, stepIndex: activeStepIndex })}
      onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
      activeStepIndex={activeStepIndex}
      allowSkipTo
      steps={assessments.map(({ title, question, answers }) => ({
        title,
        content: (
          <SpaceBetween size="l">
            <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
              <Textarea
                onChange={({ detail }) =>
                  updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'question', content: detail.value })
                }
                value={question}
              />
            </Container>
            <Container header={<Header variant="h2">Answer</Header>}>
              <SpaceBetween size="l" direction="horizontal">
                {answers.map((answer: string, answerIndex: number) => (
                  <Container key={`answer-${answerIndex}`} header={<Header variant="h2" actions={<Button iconName="close" variant="icon" />} />}>
                    <Input
                      onChange={({ detail }) =>
                        updateAssessment({
                          type: ActionTypes.Update,
                          stepIndex: activeStepIndex,
                          key: 'answers',
                          content: answers.map((answer: string, i: number) => (answerIndex === i ? detail.value : answer)),
                        })
                      }
                      value={answer}
                    />
                  </Container>
                ))}
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        ),
      }))}
    />
  );
};
