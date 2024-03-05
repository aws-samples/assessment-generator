import React, { useEffect } from 'react';
import { AppLayout, BreadcrumbGroup, Flashbar, HelpPanel, SideNavigation } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { teacherRoutes, studentRoutes } from './routes';
import { titlise } from './helpers';

const LOCALE = 'en';

const routes = true ? teacherRoutes : studentRoutes;
const router = createBrowserRouter(routes);
const [sideNavRoutes] = routes;

export function App({ signOut, user }: WithAuthenticatorProps) {
  const [activeHref, setActiveHref] = React.useState('#/parent-page/child-page1');

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
            // activeHref={activeHref}
            header={{
              href: '/',
              text: 'Gen Assess',
            }}
            onFollow={(e) => {
              // e.preventDefault();
              // setActiveHref(event.detail.href);
            }}
            items={sideNavRoutes.children.map(({ path, children }) => {
              console.log(path);
              if (children) {
                return {
                  type: 'expandable-link-group',
                  text: titlise(path),
                  href: path,
                  items: children.map(({ path: childPath }) => ({ type: 'link', text: titlise(childPath), href: `/${path}/${childPath}` })),
                };
              } else {
                return { type: 'link', text: titlise(path), href: path };
              }
            })}
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
