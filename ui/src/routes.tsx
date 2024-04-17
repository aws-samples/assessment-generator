import DefaultSettings from './pages/DefaultSettings';
import Section from './pages/Section';
import HomePage from './pages/HomePage';
import ManageKnowledgeBases from './pages/ManageKnowledgeBases';
import CreateAssessmentTemplate from './pages/CreateAssessmentTemplate';
import FindAssessments from './pages/FindAssessments';
import StudentAssessments from './pages/StudentAssessments';
import GenerateAssessments from './pages/GenerateAssessments';
import EditAssessments from './pages/EditAssessments';
import FindStudent from './pages/FindStudent';
import MyDashboard from './pages/MyDashboard';
import StudentAssessment from './pages/StudentAssessment';
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
              path: 'create-assessment-template',
              element: <CreateAssessmentTemplate />,
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
        {
          path: 'students',
          element: <FindStudent />,
        },
        // {
        //   path: 'students',
        //   element: <Section id={2} />,
        //   children: [
        //     {
        //       path: 'find-student',
        //       element: <FindStudent />,
        //     },
        //   ],
        // },
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
  ],
};
