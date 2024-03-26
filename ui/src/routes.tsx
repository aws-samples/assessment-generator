import DefaultSettings from './pages/DefaultSettings';
import Section from './pages/Section';
import HomePage from './pages/HomePage';
import CreateKowledgeBase from './pages/CreateKnowledgeBase';
import ModifyKnowledgeBase from './pages/ModifyKnowledgeBase';
import CreateAssessmentTemplate from './pages/CreateAssessmentTemplate';
import FindAssessments from './pages/FindAssessments';
import StudentAssessments from './pages/StudentAssessments';
import GenerateAssessments from './pages/GenerateAssessments';
import EditAssessments from './pages/EditAssessments';
import SendAssessments from './pages/SendAssessments';
import FindClass from './pages/FindClass';
import FindStudent from './pages/FindStudent';
import MyDashboard from './pages/MyDashboard';
import StudentAssessment from './pages/StudentAssessment';

export const routes = [
  [
    {
      path: '/',
      element: <HomePage route={0} />,
      children: [
        {
          path: 'settings',
          element: <Section id={0} />,
          children: [
            {
              path: 'default-settings',
              element: <DefaultSettings />,
            },
            {
              path: 'create-knowledge-base',
              element: <CreateKowledgeBase />,
            },
            {
              path: 'create-assessment-template',
              element: <CreateAssessmentTemplate />,
            },
            {
              path: 'modify-knowledge-base',
              element: <ModifyKnowledgeBase />,
            },
          ],
        },
        {
          path: 'assessments',
          element: <Section id={1} />,
          children: [
            {
              path: 'find-assessments',
              element: <FindAssessments />,
            },
            {
              path: 'generate-assessments',
              element: <GenerateAssessments />,
            },
            {
              path: 'send-assessments',
              element: <SendAssessments />,
            },
          ],
        },
        {
          path: 'students',
          element: <Section id={2} />,
          children: [
            {
              path: 'find-class',
              element: <FindClass />,
            },
            {
              path: 'find-student',
              element: <FindStudent />,
            },
          ],
        },
      ],
    },
    { path: 'edit-assessment/:id', element: <EditAssessments />, children: [] },
  ],
  [
    {
      path: '/',
      element: <HomePage route={1} />,
      children: [
        {
          path: 'dashboard',
          element: <MyDashboard />,
        },
        {
          path: 'assessments',
          element: <StudentAssessments />,
        },
      ],
    },
    { path: 'assessment/:id', element: <StudentAssessment />, children: [] },
  ],
];
