import React, { useState } from 'react';
import { Wizard, Container, Link, Header, SpaceBetween, FormField, Input, Button, Box, ColumnLayout, Tiles } from '@cloudscape-design/components';

const assessments = [
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

export default () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [tile, setTile] = useState('');

  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Question ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) => `Question ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step, stepNumber) => `Skip to ${step.title}`,
        cancelButton: 'Cancel',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Submit',
        optional: 'optional',
      }}
      onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
      activeStepIndex={activeStepIndex}
      allowSkipTo
      steps={assessments.map(({ title, question, answers }) => ({
        title,
        content: (
          <SpaceBetween size="l">
            <Container header={<Header variant="h2">Question {activeStepIndex + 1}</Header>}>
              <Box variant="p">{question}</Box>
            </Container>
            <Container header={<Header variant="h2">Answer</Header>}>
              <FormField label={'Choose:'}>
                <Tiles
                  value={tile}
                  items={answers.map((answer) => ({ label: answer, value: answer }))}
                  onChange={({ detail }) => setTile(detail.value)}
                />
              </FormField>
            </Container>
          </SpaceBetween>
        ),
      }))}
    />
  );
};
