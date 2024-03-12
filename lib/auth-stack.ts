import { Construct } from 'constructs';
import { NestedStack, NestedStackProps, aws_cognito, CfnOutput, aws_dynamodb } from 'aws-cdk-lib';

export class AuthStack extends NestedStack {
  public userpool: aws_cognito.UserPool;
  public client: aws_cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    this.userpool = new aws_cognito.UserPool(this, 'pool', {
      selfSignUpEnabled: true,
      signInAliases: { username: false, email: true },
      autoVerify: { email: true },
    });

    let teachersUserGroup = new aws_cognito.CfnUserPoolGroup(this, "TeachersGroup", {
      groupName: "teachers",
      userPoolId: this.userpool.userPoolId
    });

    let studentsUserGroup = new aws_cognito.CfnUserPoolGroup(this, "StudentsGroup", {
      groupName: "students",
      userPoolId: this.userpool.userPoolId
    });


    this.client = this.userpool.addClient('gen-assess-client');
  }
}
