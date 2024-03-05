import React from 'react';
import DefaultSettings from './pages/DefaultSettings';
import Settings from './pages/Settings';
import CreateKowledgeBase from './pages/CreateKnowledgeBase';
import ModifyKnowledgeBase from './pages/ModifyKnowledgeBase';
import CreateAssessmentTemplate from './pages/CreateAssessmentTemplate';

export const commonRoutes = [
  {
    path: '/',
    element: <div>Home</div>,
  },
];

export const teacherRoutes = [
  {
    path: '/settings',
    element: <Settings />,
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
    path: '/assessments',
    element: <div>Assessments</div>,
  },
  {
    path: '/students',
    element: <div>Students</div>,
  },
];
