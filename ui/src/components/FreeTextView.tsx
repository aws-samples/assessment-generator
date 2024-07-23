import { Container, Header, SpaceBetween, Textarea, Table, Input } from '@cloudscape-design/components';
import { FreeText } from '../graphql/API';
import { ActionTypes } from '../pages/EditAssessments';

type FreeTextViewProps = {
  activeStepIndex: number;
  freetextAssessment: FreeText;
  updateAssessment: (props: { type: ActionTypes; stepIndex: number; key: string; content: any }) => void;
};

export const FreeTextView = ({ activeStepIndex, freetextAssessment, updateAssessment }: FreeTextViewProps) => {
  const { question, rubric } = freetextAssessment;
  const rubrics = rubric.map((val, i) => ({ index: i, ...val }));

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
        <Table
          columnDefinitions={[
            {
              id: 'weight',
              header: 'Weight',
              cell: (item) => item.weight,
              editConfig: {
                editingCell: (item, { currentValue, setValue }) => (
                  <Input autoFocus={true} value={currentValue ?? item.weight} onChange={(event) => setValue(event.detail.value)} />
                ),
              },
            },
            {
              id: 'point',
              header: 'Point',
              cell: (item) => item.point,
              editConfig: {
                editingCell: (item, { currentValue, setValue }) => (
                  <Textarea autoFocus={true} value={currentValue ?? item.point} onChange={(event) => setValue(event.detail.value)} />
                ),
              },
            },
          ]}
          submitEdit={(item, column, newValue) => {
            const newRubric = rubrics.map(({ index, ...val }) =>
              item.index === index ? { ...val, [column.id!]: column.id === 'weight' ? +(newValue as string) : newValue } : val
            );
            updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'rubric', content: newRubric });
          }}
          items={rubrics}
        />
      </Container>
    </SpaceBetween>
  );
};
