import { useEffect, useState } from 'react';
import { AppLayout, BreadcrumbGroup, Flashbar, HelpPanel, SideNavigation, FlashbarProps, TopNavigation } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { routes } from './routes';
import { titlise } from './helpers';
import { AlertType, DispatchAlertContext } from './contexts/alerts';
import { UserProfileContext, UserProfile } from './contexts/userProfile';
import { fetchAuthSession } from 'aws-amplify/auth';

const LOCALE = 'en';

export function App({ signOut, user }: WithAuthenticatorProps) {
  const [alerts, setAlerts] = useState<FlashbarProps.MessageDefinition[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();

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

  useEffect(() => {
    fetchAuthSession()
      .then((session) =>
        setUserProfile({
          ...user,
          group: (session.tokens?.idToken?.payload as any)['cognito:groups'][0],
          email: session.tokens?.idToken?.payload.email,
          name: session.tokens?.idToken?.payload.name,
        } as UserProfile)
      )
      .catch(() => dispatchAlert({ type: AlertType.ERROR }));
  }, []);

  if (!userProfile?.group) return null;

  const currentRoutes = (routes as any)[userProfile.group];
  const router = createBrowserRouter(currentRoutes);
  const [sideNavRoutes] = currentRoutes;

  return (
    <DispatchAlertContext.Provider value={dispatchAlert}>
      <UserProfileContext.Provider value={userProfile}>
        <I18nProvider locale={LOCALE} messages={[messages]}>
          <div id="h">
            <TopNavigation
              identity={{
                href: '#',
                // title: 'Gen Assess',
              }}
              utilities={[
                {
                  type: 'menu-dropdown',
                  text: userProfile?.name,
                  description: `Profile: ${userProfile?.group?.toUpperCase()}`,
                  iconName: 'user-profile',
                  items: [{ id: 'signout', text: 'Sign out' }],
                  onItemClick: ({ detail }) => {
                    if (detail.id === 'signout') signOut && signOut();
                  },
                },
              ]}
            />
          </div>
          <AppLayout
            headerSelector="#h"
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
      </UserProfileContext.Provider>
    </DispatchAlertContext.Provider>
  );
}

export default withAuthenticator(App, { signUpAttributes: ['name'] });
