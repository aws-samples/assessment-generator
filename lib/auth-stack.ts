import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_cognito, Duration, NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class AuthStack extends NestedStack {
  public userPool: aws_cognito.UserPool;
  public client: aws_cognito.UserPoolClient;
  public identityPool: IdentityPool;
  public postConfirmationLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    const postConfirmation = new NodejsFunction(this, "PostConfirmationLambdaFunction", {
      entry: path.resolve(__dirname, 'lambdas', 'postConfirmation.ts'),
      handler: 'postConfirmation',
      runtime: Runtime.NODEJS_20_X,
      environment: {
        'STUDENTS_TABLE_PARAM': '/gen-assess/student-table-name',
      },
      timeout: Duration.seconds(30),
    });

    const userPool = new aws_cognito.UserPool(this, 'pool', {
      selfSignUpEnabled: true,
      signInAliases: { username: false, email: true },
      autoVerify: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postConfirmation: postConfirmation,
      },
    });

    const userPoolParam = new StringParameter(this, 'UserPoolParameter', {
      parameterName: '/gen-assess/user-pool-id',
      stringValue: userPool.userPoolId,
    });
    const policy = new Policy(this, 'lambdaPolicyUserPool', {
      statements: [
        new PolicyStatement({
          actions: ['cognito-idp:AdminGetUser', 'cognito-idp:AdminAddUserToGroup', 'cognito-idp:AdminEnableUser', 'cognito-idp:AdminDisableUser'],
          resources: [userPool.userPoolArn],
        }),
        new PolicyStatement({
          actions: ['ssm:DescribeParameters'],
          resources: ['*'],
        }),
        new PolicyStatement({
          actions: ['ssm:GetParameter*'],
          resources: [this.formatArn({
            service: "ssm",
            region: cdk.Aws.REGION,
            account: cdk.Aws.ACCOUNT_ID,
            resource: "parameter",
            resourceName: "gen-assess/*",
          })],
        }),
      ],
    });

    if (!postConfirmation.role) {
      throw new Error("err");
    }
    policy.attachToRole(postConfirmation.role);

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
    this.postConfirmationLambda = postConfirmation;
  }
}
