import DefaultSettings from './pages/DefaultSettings';
import Section from './pages/Section';
import HomePage from './pages/HomePage';
import ManageKnowledgeBases from './pages/ManageKnowledgeBases';
import Templates from './pages/Templates';
import FindAssessments from './pages/FindAssessments';
import StudentAssessments from './pages/StudentAssessments';
import GenerateAssessments from './pages/GenerateAssessments';
import EditAssessments from './pages/EditAssessments';
// import FindStudent from './pages/FindStudent';
import MyDashboard from './pages/MyDashboard';
import StudentAssessment from './pages/StudentAssessment';
import ReviewAssessment from './pages/ReviewAssessment';
import Courses from './pages/Courses';

export const routes = {
  teachers: [
    {
      path: '/',
      element: <HomePage />,
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
              path: 'manage-knowledge-bases',
              element: <ManageKnowledgeBases />,
            },
            {
              path: 'templates',
              element: <Templates />,
            },
            {
              path: 'courses',
              element: <Courses />,
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
          ],
        },
      ],
    },
    { path: 'edit-assessment/:id', element: <EditAssessments />, children: [] },
  ],
  students: [
    {
      path: '/',
      element: <HomePage />,
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
    { path: 'review/:id', element: <ReviewAssessment />, children: [] },
  ],
};
