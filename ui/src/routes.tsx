import React from 'react';
import DefaultSettings from './pages/DefaultSettings';
import Section from './pages/Section';
import HomePage from './pages/HomePage';
import CreateKowledgeBase from './pages/CreateKnowledgeBase';
import ModifyKnowledgeBase from './pages/ModifyKnowledgeBase';
import CreateAssessmentTemplate from './pages/CreateAssessmentTemplate';
import FindExistingAssessments from './pages/FindExistingAssessments';
import GenerateAssessments from './pages/GenerateAssessments';
import EditAssessments from './pages/EditAssessments';
import SendAssessments from './pages/SendAssessments';
import FindClass from './pages/FindClass';
import FindStudent from './pages/FindStudent';

export const studentRoutes = [];

export const teacherRoutes = [
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
];
