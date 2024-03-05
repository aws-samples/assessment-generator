import React from 'react';
import DefaultSettings from './pages/DefaultSettings';
import Settings from './pages/Settings';
import Assessments from './pages/Assessments';
import CreateKowledgeBase from './pages/CreateKnowledgeBase';
import ModifyKnowledgeBase from './pages/ModifyKnowledgeBase';
import CreateAssessmentTemplate from './pages/CreateAssessmentTemplate';
import FindExistingAssessments from './pages/FindExistingAssessments';
import GenerateAssessments from './pages/GenerateAssessments';
import EditAssessments from './pages/EditAssessments';
import SendAssessments from './pages/SendAssessments';

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
    element: <Assessments />,
    children: [
      {
        path: 'find-existing-assessments',
        element: <FindExistingAssessments />,
      },
      {
        path: 'generate-assessments',
        element: <GenerateAssessments />,
      },
      {
        path: 'edit-assessments',
        element: <EditAssessments />,
      },
      {
        path: 'send-assessments',
        element: <SendAssessments />,
      },
    ],
  },
  {
    path: '/students',
    element: <div>Students</div>,
  },
];
