import { Container, Header, SpaceBetween, Textarea, Table, Input, Button } from '@cloudscape-design/components';
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

  const submitRubricChanges = (key: string, item: any, newValue: string | number) => {
    const newRubric = rubrics.map(({ index, ...val }) => (item.index === index ? { ...val, [key]: newValue } : val));
    updateAssessment({ type: ActionTypes.Update, stepIndex: activeStepIndex, key: 'rubric', content: newRubric });
  };

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
          wrapLines
          columnDefinitions={[
            {
              id: 'delete',
              header: (
                <Header
                  actions={
                    <Button
                      iconName="add-plus"
                      variant="primary"
                      onClick={() =>
                        updateAssessment({
                          type: ActionTypes.Update,
                          stepIndex: activeStepIndex,
                          key: 'rubric',
                          content: [...rubric, { weight: 0, point: '' }],
                        })
                      }
                    />
                  }
                />
              ),
              maxWidth: 20,
              cell: (item) => (
                <Button
                  iconName="close"
                  onClick={() =>
                    updateAssessment({
                      type: ActionTypes.Update,
                      stepIndex: activeStepIndex,
                      key: 'rubric',
                      content: rubrics.filter((_, i) => item.index !== i).map(({ index, ...val }) => val),
                    })
                  }
                />
              ),
            },
            {
              id: 'weight',
              header: 'Weights',
              maxWidth: 30,
              cell: (item) => <Input value={'' + item.weight} onChange={(event) => submitRubricChanges('weight', item, +event.detail.value)} />,
            },
            {
              id: 'point',
              header: 'Points',
              cell: (item) => <Textarea value={'' + item.point} onChange={(event) => submitRubricChanges('point', item, event.detail.value)} />,
            },
          ]}
          items={rubrics}
        />
      </Container>
    </SpaceBetween>
  );
};
