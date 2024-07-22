import { Container, Header, SpaceBetween, Textarea } from '@cloudscape-design/components';
import { FreeText } from '../graphql/API';
import { ActionTypes } from '../pages/EditAssessments';

type FreeTextViewProps = {
  activeStepIndex: number;
  freetextAssessment: FreeText;
  updateAssessment: (props: { type: ActionTypes; stepIndex: number; key: string; content: any }) => void;
};

export const FreeTextView = ({ activeStepIndex, freetextAssessment, updateAssessment }: FreeTextViewProps) => {
  const { question, rubric } = freetextAssessment;
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
      <Container header={<Header variant="h2">Rubric</Header>}>
        <Textarea
          onChange={({ detail }) => updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'rubric', content: detail.value })}
          value={rubric}
        />
      </Container>
    </SpaceBetween>
  );
};
