import { Construct } from 'constructs';
import { CfnOutput, Stack, StackProps, aws_s3, RemovalPolicy, aws_iam } from 'aws-cdk-lib';
import { AuthStack } from './auth-stack';
import { DataStack } from './data-stack';
import { FrontendStack } from './frontend-stack';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import * as cr from 'aws-cdk-lib/custom-resources';
import { RagPipelineStack } from './rag-pipeline/rag-pipeline-stack';

export class GenAssessStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const authStack = new AuthStack(this, 'AuthStack');

    const ragPipipelineStack = new RagPipelineStack(this, 'RagStack');

    const { api } = new DataStack(this, 'DataStack', { userPool: authStack.userPool });

    const frontendStack = new FrontendStack(this, 'FrontendStack', { ...props, graphqlUrl: api.graphqlUrl });

    const storageBucket = new aws_s3.Bucket(this, 'StorageBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    storageBucket.grantReadWrite(authStack.identityPool.authenticatedRole);

    const config = {
      Auth: {
        Cognito: {
          userPoolId: authStack.userPool.userPoolId,
          userPoolClientId: authStack.client.userPoolClientId,
          identityPoolId: authStack.identityPool.identityPoolId,
        },
      },
      API: {
        GraphQL: {
          endpoint: api.graphqlUrl,
          region: this.region,
          defaultAuthMode: 'userPool',
        },
      },
      Storage: {
        S3: {
          region: this.region,
          bucket: storageBucket.bucketName,
        },
      },
    };

    new StringParameter(this, 'ConfigParameter', {
      parameterName: 'GenAssessConfig',
      stringValue: JSON.stringify(config),
    });

    const putConfig = new cr.AwsCustomResource(this, 'PutConfig', {
      onUpdate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Bucket: frontendStack.bucket.bucketName,
          Key: 'config.json',
          Body: JSON.stringify(config),
        },
        physicalResourceId: cr.PhysicalResourceId.of('NO_DELETE_REQUIRED'),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [frontendStack.bucket.bucketArn, `${frontendStack.bucket.bucketArn}/*`],
      }),
      installLatestAwsSdk: false,
    });

    putConfig.node.addDependency(frontendStack.assetDeployment);
    putConfig.node.addDependency(authStack);

    new CfnOutput(this, 'UiConfing', {
      value: JSON.stringify(config),
    });

    new CfnOutput(this, 'ApplicationUrl', {
      value: frontendStack.applicationURL,
    });

    new CfnOutput(this, 'RAGBucketSource', {
      value: ragPipipelineStack.artifactsUploadBucket.bucketName,
    });
  }
}
