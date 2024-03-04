import React from 'react';
import { AppLayout, BreadcrumbGroup, Flashbar, HelpPanel, SideNavigation } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { commonRoutes, teacherRoutes } from './routes';

const LOCALE = 'en';

const router = createBrowserRouter([...commonRoutes, ...teacherRoutes]);

export function App({ signOut, user }: WithAuthenticatorProps) {
  return (
    <I18nProvider locale={LOCALE} messages={[messages]}>
      <AppLayout
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: 'Home', href: '#' },
              { text: 'Service', href: '#' },
            ]}
          />
        }
        navigationOpen={true}
        navigation={
          <SideNavigation
            header={{
              href: '/',
              text: 'Gen Assess',
            }}
            items={teacherRoutes.map(({ path }) => ({ type: 'link', text: path.slice(1), href: path }))}
          />
        }
        notifications={
          <Flashbar
            items={[
              {
                type: 'info',
                dismissible: true,
                content: 'This is an info flash message.',
                id: 'message_1',
              },
            ]}
          />
        }
        toolsOpen={false}
        tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
        content={<RouterProvider router={router} />}
      />
    </I18nProvider>
  );
}

export default withAuthenticator(App);
