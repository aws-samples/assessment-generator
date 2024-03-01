import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput, aws_dynamodb } from 'aws-cdk-lib';
import { AuthStack } from './auth-stack';
import { DataStack } from './data-stack';
import {FrontendStack} from "./frontend-stack";

export class GenAssessStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const auth = new AuthStack(this, 'AuthStack');

    const { api } = new DataStack(this, 'DataStack', { userpool: auth.userpool });

    const frontendStack = new FrontendStack(this, 'FrontendStack', {...props, graphqlUrl: api.graphqlUrl});

    new CfnOutput(this, 'UiConfing', {
      value: JSON.stringify({
        Auth: { Cognito: { userPoolId: auth.userpool.userPoolId, userPoolClientId: auth.client.userPoolClientId } },
        API: {
          GraphQL: {
            endpoint: api.graphqlUrl,
            region: this.region,
            defaultAuthMode: 'userPool',
          },
        },
      }),
    });
  }
}
