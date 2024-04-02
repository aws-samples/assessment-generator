import * as cdk from 'aws-cdk-lib';
import {
  ArnFormat,
  aws_dynamodb,
  aws_iam,
  aws_s3,
  CfnOutput,
  NestedStack,
  NestedStackProps,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from "path";
import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import * as opensearchserverless from 'aws-cdk-lib/aws-opensearchserverless';
import { ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";


/**
 * The maximum time the processing lambda
 * is allowed to run.
 */
const PROCESSING_TIMEOUT = cdk.Duration.seconds(30);

/**
 * The execution runtime for used compute.
 */
const EXECUTION_RUNTIME = Runtime.NODEJS_18_X;

/**
 * The default memory size to allocate for the compute.
 */
const DEFAULT_MEMORY_SIZE = 512;

const NAMESPACE = "genassess-rag";

const DOCUMENT_PROCESSOR_NAME = 'DocumentProcessor';

export class RagPipelineStack extends NestedStack {
  public artifactsUploadBucket: Bucket;
  public documentProcessor: NodejsFunction;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    // The OpenSearch Serverless domain.
    const opssSearchCollection = "opss-sc";

    const networkSecurityPolicy = [{
      "Rules": [
        {
          "Resource": [
            `collection/${opssSearchCollection}`,
          ],
          "ResourceType": "dashboard",
        },
        {
          "Resource": [
            `collection/${opssSearchCollection}`,
          ],
          "ResourceType": "collection",
        },
      ],
      "AllowFromPublic": true,
    }];

    const networkSecurityPolicyName = `${opssSearchCollection}-security-policy`;
    const cfnNetworkSecurityPolicy = new opensearchserverless.CfnSecurityPolicy(this, "NetworkSecurityPolicy", {
      name: networkSecurityPolicyName,
      type: "network",
      policy: JSON.stringify(networkSecurityPolicy),
    });

    const encryptionSecurityPolicy = {
      "Rules": [
        {
          "Resource": [
            `collection/${opssSearchCollection}`,
          ],
          "ResourceType": "collection",
        },
      ],
      "AWSOwnedKey": true,
    };

    const encryptionSecuritiyPolicyName = `${opssSearchCollection}-security-policy`;
    const cfnEncryptionSecurityPolicy = new opensearchserverless.CfnSecurityPolicy(this, "EncryptionSecurityPolicy", {
      name: encryptionSecuritiyPolicyName,
      policy: JSON.stringify(encryptionSecurityPolicy),
      type: "encryption",
    });


    const cfnCollection = new opensearchserverless.CfnCollection(this, opssSearchCollection, {
      name: opssSearchCollection,
      type: "VECTORSEARCH",
    });
    cfnCollection.addDependency(cfnNetworkSecurityPolicy);
    cfnCollection.addDependency(cfnEncryptionSecurityPolicy);

    //TODO scope it down to what's required
    const bedrockExecutionRole = new aws_iam.Role(this, 'AmazonBedrockExecutionRoleForKnowledgeBase_1', {
      assumedBy: new aws_iam.ServicePrincipal('bedrock.amazonaws.com').withConditions({
        "StringEquals": {
          "aws:SourceAccount": this.account,
        },
        "ArnLike": {
          "aws:SourceArn": `arn:aws:bedrock:${this.region}:${this.account}:knowledge-base/*`,
        },
      }),
    });
    bedrockExecutionRole.addToPolicy(new PolicyStatement({
      "effect": aws_iam.Effect.ALLOW,
      "resources": [
        `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v1`,
      ],
      "actions": [
        "bedrock:InvokeModel",
      ],
    }));
    bedrockExecutionRole.addToPolicy(new PolicyStatement({
      "effect": aws_iam.Effect.ALLOW,
      "actions": [
        "bedrock:ListFoundationModels",
        "bedrock:ListCustomModels",
      ],
      "resources": ["*"],
    }));
    bedrockExecutionRole.addToPolicy(new PolicyStatement({
      "effect": aws_iam.Effect.ALLOW,
      "resources": [
        cfnCollection.attrArn,
      ],
      "actions": [
        "aoss:APIAccessAll",
      ],
    }));


    //TODO scope it down to what's required
    const lambdaRole = new aws_iam.Role(this, 'OpssAdminRole', {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaSQSQueueExecutionRole"),
      ],
    });

    const dataAccessPolicy = [
      {
        "Rules": [
          {
            "Resource": [
              `collection/${opssSearchCollection}`,
            ],
            "Permission": [
              "aoss:CreateCollectionItems",
              "aoss:DeleteCollectionItems",
              "aoss:UpdateCollectionItems",
              "aoss:DescribeCollectionItems",
            ],
            "ResourceType": "collection",
          },
          {
            "Resource": [
              `index/${opssSearchCollection}/*`,
            ],
            "Permission": [
              "aoss:CreateIndex",
              "aoss:DeleteIndex",
              "aoss:UpdateIndex",
              "aoss:DescribeIndex",
              "aoss:ReadDocument",
              "aoss:WriteDocument",
            ],
            "ResourceType": "index",
          },
        ],
        "Principal": [
          `${lambdaRole.roleArn}`,
          `${bedrockExecutionRole.roleArn}`,
          "arn:aws:sts::089689156629:assumed-role/consoleAccess/mriccia-Isengard", //TODO remove before publishing
        ],
        "Description": "data-access-rule",
      },
    ];

    const dataAccessPolicyName = `${opssSearchCollection}-policy`;
    const cfnAccessPolicy = new opensearchserverless.CfnAccessPolicy(this, "OpssDataAccessPolicy", {
      name: dataAccessPolicyName,
      policy: JSON.stringify(dataAccessPolicy),
      type: "data",
    });


    lambdaRole.addToPolicy(new PolicyStatement({
      "sid": "AdministeringOpenSearchServerlessCollections1",
      "effect": aws_iam.Effect.ALLOW,
      "resources": [
        cfnCollection.attrArn,
      ],
      "actions": [
        "aoss:CreateCollection",
        "aoss:DeleteCollection",
        "aoss:UpdateCollection",
      ],
    }));
    lambdaRole.addToPolicy(new PolicyStatement({
      "sid": "AdministeringOpenSearchServerlessCollections2",
      "effect": aws_iam.Effect.ALLOW,
      "resources": ["*"],
      "actions": [
        "aoss:BatchGetCollection",
        "aoss:ListCollections",
        "aoss:CreateAccessPolicy",
        "aoss:CreateSecurityPolicy",
      ],
    }));
    lambdaRole.addToPolicy(new PolicyStatement({
      "sid": "OpenSearchServerlessDataPlaneAccess1",
      "effect": aws_iam.Effect.ALLOW,
      "resources": [
        this.formatArn({
          service: "aoss",
          resource: "collection",
          region: cdk.Aws.REGION,
          account: cdk.Aws.ACCOUNT_ID,
          arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
          resourceName: "*", //TODO restrict to specific resource
        }),
      ],
      "actions": [
        "aoss:APIAccessAll",
        "aoss:DashboardAccessAll",
      ],
    }));

    //Add Bedrock permissions on the Lambda function
    lambdaRole.addToPolicy(new PolicyStatement({
      "effect": aws_iam.Effect.ALLOW,
      "resources": [
        "*",
      ],
      "actions": [
        "bedrock:*",
      ],
    }));

    lambdaRole.addToPolicy(new PolicyStatement({
      "effect": aws_iam.Effect.ALLOW,
      "actions": [
        "iam:PassRole",
      ],
      "resources": [
        bedrockExecutionRole.roleArn,
      ],
    }));


    // Display the OpenSearch endpoint.
    new CfnOutput(this, 'OpenSearchEndpoint', {
      description: 'The endpoint of the OpenSearch domain.',
      value: cfnCollection.attrCollectionEndpoint,
    });
    new CfnOutput(this, 'DashboardsURL', {
      description: 'The endpoint of the OpenSearch dashboard.',
      value: cfnCollection.attrDashboardEndpoint,
    });

    // The source artifactsUploadBucket.
    this.artifactsUploadBucket = new s3.Bucket(this, 'ArtifactsUploadBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
      cors: [
        {
          allowedMethods: [aws_s3.HttpMethods.HEAD, aws_s3.HttpMethods.GET, aws_s3.HttpMethods.POST, aws_s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
    });

    // The bucket utilised for raw files to be ingested in the KB
    const kbStagingBucket = new s3.Bucket(this, 'KBStorageBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
    });
    kbStagingBucket.grantReadWrite(bedrockExecutionRole);

    // Creating the log group.
    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `/${NAMESPACE}/${cdk.Stack.of(this).stackName}/${DOCUMENT_PROCESSOR_NAME}/${this.node.addr}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    const kbTable = new aws_dynamodb.TableV2(this, 'KBTable', {
      partitionKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'courseId', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });


    this.documentProcessor = new NodejsFunction(this, DOCUMENT_PROCESSOR_NAME, {
      description: 'Processes uploaded S3 documents and adds to the KB.',
      entry: path.resolve(__dirname, 'lambdas', 'event-handler', 'index.ts'),
      memorySize: DEFAULT_MEMORY_SIZE,
      role: lambdaRole,
      timeout: PROCESSING_TIMEOUT,
      runtime: EXECUTION_RUNTIME,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logGroup: logGroup,
      environment: {
        POWERTOOLS_SERVICE_NAME: "document-processor",
        POWERTOOLS_METRICS_NAMESPACE: NAMESPACE,
        BEDROCK_ROLE_ARN: bedrockExecutionRole.roleArn,
        OPSS_HOST: cfnCollection.attrCollectionEndpoint,
        OPSS_COLLECTION_ARN: cfnCollection.attrArn,
        KB_STAGING_BUCKET: kbStagingBucket.bucketName,
        ARTIFACTS_UPLOAD_BUCKET: this.artifactsUploadBucket.bucketName,
        KB_TABLE: kbTable.tableName,
      },
      bundling: {
        minify: true,
        externalModules: [
          '@aws-sdk/client-s3',
          '@aws-sdk/client-sns',
        ],
      },
    });
    this.artifactsUploadBucket.grantRead(this.documentProcessor);
    kbStagingBucket.grantReadWrite(this.documentProcessor);
    kbTable.grantReadWriteData(this.documentProcessor);

    // Display the source artifactsUploadBucket information in the console.
    new CfnOutput(this, 'SourceBucket', {
      description: 'The name of the source artifactsUploadBucket.',
      value: this.artifactsUploadBucket.bucketName,
    });

  }
}
