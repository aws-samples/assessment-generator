'use client';

import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { AppLayout, BreadcrumbGroup, Flashbar, HelpPanel, SideNavigation, FlashbarProps } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { PropsWithChildren, useState } from 'react';
import { DispatchAlertContext } from '../contexts/alerts';

const LOCALE = 'en';

Amplify.configure({
  Auth: { Cognito: { userPoolId: 'eu-west-1_3CWlxAYfX', userPoolClientId: '1rfn83r7qoli3h8pdotspdhmhe' } },
  API: {
    GraphQL: {
      endpoint: 'https://gbw2lzwq7nardaq4sixlhrgtwu.appsync-api.eu-west-1.amazonaws.com/graphql',
      region: 'eu-west-1',
      defaultAuthMode: 'userPool',
    },
  },
});

interface LayoutProps extends WithAuthenticatorProps, PropsWithChildren {}

export function Layout({ signOut, user, children }: LayoutProps) {
  const [alerts, setAlerts] = useState<FlashbarProps.MessageDefinition[]>([]);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const dispatchAlert = (newAlert: FlashbarProps.MessageDefinition) => {
    const id = Date.now().toString();
    setAlerts([
      ...alerts,
      {
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
          content={children}
          breadcrumbs={
            <BreadcrumbGroup
              items={[
                { text: 'Home', href: '/' },
                { text: 'Service', href: '#' },
              ]}
            />
          }
          navigationOpen={navigationOpen}
          onNavigationChange={(e) => setNavigationOpen(e.detail.open)}
          navigation={
            <SideNavigation
              header={{
                href: '#',
                text: 'Feedback Collection Tool',
              }}
              items={[{ type: 'link', text: `Summaries`, href: `/list` }]}
            />
          }
          toolsOpen={false}
          tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
          notifications={<Flashbar items={alerts} />}
          // splitPanel={<SplitPanel header="Split panel header">Split panel content</SplitPanel>}
        />
      </I18nProvider>
    </DispatchAlertContext.Provider>
  );
}

export default withAuthenticator(Layout, { signUpAttributes: ['email'], loginMechanism: 'email' });
