import { Construct } from 'constructs';
import { NestedStack, NestedStackProps, aws_cognito } from 'aws-cdk-lib';
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';

export class AuthStack extends NestedStack {
  public userPool: aws_cognito.UserPool;
  public client: aws_cognito.UserPoolClient;
  public identityPool: IdentityPool;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    const userPool = new aws_cognito.UserPool(this, 'pool', {
      selfSignUpEnabled: true,
      signInAliases: { username: false, email: true },
      autoVerify: { email: true },
    });

    const teachersUserGroup = new aws_cognito.CfnUserPoolGroup(this, 'TeachersGroup', {
      groupName: 'teachers',
      userPoolId: userPool.userPoolId,
    });

    const studentsUserGroup = new aws_cognito.CfnUserPoolGroup(this, 'StudentsGroup', {
      groupName: 'students',
      userPoolId: userPool.userPoolId,
    });

    const client = userPool.addClient('gen-assess-client');

    const identityPool = new IdentityPool(this, 'IdentityPool', {
      authenticationProviders: {
        userPools: [new UserPoolAuthenticationProvider({ userPool, userPoolClient: client })],
      },
    });

    this.userPool = userPool;
    this.client = client;
    this.identityPool = identityPool;
  }
}
