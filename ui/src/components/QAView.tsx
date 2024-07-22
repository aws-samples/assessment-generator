import { Container, Header, SpaceBetween, Button, Textarea, Tiles } from '@cloudscape-design/components';
import { MultiChoice } from '../graphql/API';
import { ActionTypes } from '../pages/EditAssessments';

type QAViewProps = {
  activeStepIndex: number;
  multiChoiceAssessment: MultiChoice;
  updateAssessment: (props: { type: ActionTypes; stepIndex: number; key: string; content: any }) => void;
};

export const QAView = ({ activeStepIndex, multiChoiceAssessment, updateAssessment }: QAViewProps) => {
  const { question, answerChoices, correctAnswer, explanation } = multiChoiceAssessment;

  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Edit Question {activeStepIndex + 1}</Header>}>
        <Textarea
          onChange={({ detail }) =>
            updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'question', content: detail.value })
          }
          value={question}
        />
      </Container>
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
                    content: answerChoices.map((answerChoice, i) => (answerIndex === i ? detail.value : answerChoice)),
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
          items={answerChoices.map((answerChoice, i) => ({ label: answerChoice, value: i.toString() }))}
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
      <Container header={<Header variant="h2">Explanation</Header>}>
        <Textarea
          onChange={({ detail }) =>
            updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'explanation', content: detail.value })
          }
          value={explanation}
        />
      </Container>
    </SpaceBetween>
  );
};
