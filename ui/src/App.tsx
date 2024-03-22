import { useState } from 'react';
import { AppLayout, BreadcrumbGroup, Flashbar, HelpPanel, SideNavigation, FlashbarProps } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { routes } from './routes';
import { titlise } from './helpers';
import { AlertType, DispatchAlertContext } from './contexts/alerts';

const LOCALE = 'en';

const currentRoutes = routes[0];
const router = createBrowserRouter(currentRoutes);
const [sideNavRoutes] = currentRoutes;

// export function App({ signOut, user }: WithAuthenticatorProps) {
export function App() {
  const [alerts, setAlerts] = useState<FlashbarProps.MessageDefinition[]>([]);

  const dispatchAlert = (newAlert: FlashbarProps.MessageDefinition) => {
    const id = Date.now().toString();
    setAlerts([
      ...alerts,
      {
        content: newAlert.type === AlertType.SUCCESS ? 'Successful' : 'Unsuccessful, please try again',
        ...newAlert,
        id,
        dismissible: true,
        onDismiss: () => setAlerts((alerts) => alerts.filter((currentAlert) => currentAlert.id !== id)),
      },
    ]);
  };

  return (
    <DispatchAlertContext.Provider value={dispatchAlert}>
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
              activeHref={window.location.pathname}
              header={{
                href: '/',
                text: 'Gen Assess',
              }}
              onFollow={(_e) => {
                // e.preventDefault();
              }}
              items={sideNavRoutes.children.map(({ path, children }: any) => {
                if (children) {
                  return {
                    type: 'expandable-link-group',
                    text: titlise(path),
                    href: `/${path}`,
                    // href: path,
                    items: children.map(({ path: childPath }: any) => ({ type: 'link', text: titlise(childPath), href: `/${path}/${childPath}` })),
                  };
                } else {
                  return { type: 'link', text: titlise(path), href: `/${path}` };
                }
              })}
            />
          }
          notifications={<Flashbar items={alerts} />}
          toolsOpen={false}
          tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
          content={<RouterProvider router={router} />}
        />
      </I18nProvider>
    </DispatchAlertContext.Provider>
  );
}

export default withAuthenticator(App);
