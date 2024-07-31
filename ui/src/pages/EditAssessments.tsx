import { useState, useReducer, useEffect, useContext } from 'react';
import { Wizard } from '@cloudscape-design/components';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { Assessment, AssessType, MultiChoice, FreeText } from '../graphql/API';
import { getAssessment } from '../graphql/queries';
import { upsertAssessment } from '../graphql/mutations';
import { DispatchAlertContext, AlertType } from '../contexts/alerts';
import { QAView } from '../components/QAView';
import { FreeTextView } from '../components/FreeTextView';
import { removeTypenames } from '../helpers';

const client = generateClient();

export enum ActionTypes {
  Delete,
  Update,
  Put,
}

type Reducer = (state: Assessment, actions: { type: ActionTypes; stepIndex?: number; key?: string; content?: any }) => Assessment;

const reducer: Reducer = (state, actions) => {
  const { type, stepIndex, key, content } = actions;
  switch (type) {
    case ActionTypes.Put:
      return content;
    case ActionTypes.Delete: {
      // @ts-ignore
      const newQuestions = state[state.assessType]?.toSpliced(stepIndex!, 1);
      return { ...state, [state.assessType]: newQuestions };
    }
    case ActionTypes.Update: {
      const newQuestions = state[state.assessType]!.map((section, i) => {
        if (stepIndex !== i) return section;
        const newSection: any = { ...section };
        newSection[key!] = content;
        return newSection;
      });
      return { ...state, [state.assessType]: newQuestions };
    }
    default:
      throw Error('Unknown Action');
  }
};

export default () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatchAlert = useContext(DispatchAlertContext);

  const [assessment, updateAssessment] = useReducer(reducer, {} as Assessment);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    client
      .graphql<any>({ query: getAssessment, variables: { id: params.id! } })
      .then(({ data }) => {
        const result = data.getAssessment;
        if (!result) throw new Error();
        const { updatedAt, ...content } = removeTypenames(result);
        updateAssessment({ type: ActionTypes.Put, content });
      })
      .catch(() => {});
  }, []);

  const steps =
    assessment[assessment.assessType]?.map((q) => ({
      title: q.title,
      content:
        assessment.assessType === AssessType.multiChoiceAssessment ? (
          <QAView activeStepIndex={activeStepIndex} multiChoiceAssessment={q as MultiChoice} updateAssessment={updateAssessment} />
        ) : (
          <FreeTextView activeStepIndex={activeStepIndex} freetextAssessment={q as FreeText} updateAssessment={updateAssessment} />
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
