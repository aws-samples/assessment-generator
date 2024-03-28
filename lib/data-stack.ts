import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {
  aws_appsync,
  aws_cognito,
  aws_dynamodb,
  aws_iam,
  aws_logs, Duration,
  NestedStack,
  NestedStackProps,
  RemovalPolicy,
  aws_lambda_nodejs,
} from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import * as s3 from "aws-cdk-lib/aws-s3";

export const feedbacksDbName = 'feedbacks';
export const feedbacksTableName = 'feedbacks';

interface DataStackProps extends NestedStackProps {
  userPool: aws_cognito.UserPool;
}

export class DataStack extends NestedStack {
  public readonly api: aws_appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    const { userPool } = props;

    const api = new aws_appsync.GraphqlApi(this, 'Api', {
      name: 'Api',
      definition: aws_appsync.Definition.fromFile('lib/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: aws_appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool },
        },
      },
      logConfig: { retention: aws_logs.RetentionDays.ONE_WEEK, fieldLogLevel: aws_appsync.FieldLogLevel.ALL },
    });

    /////////// Settings

    const settingsTable = new aws_dynamodb.TableV2(this, 'SettingsTable', {
      partitionKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const settingsDs = api.addDynamoDbDataSource('SettingsDataSource', settingsTable);

    settingsDs.createResolver('QueryGetSettingsResolver', {
      typeName: 'Query',
      fieldName: 'getSettings',
      code: aws_appsync.Code.fromAsset('lib/resolvers/getSettings.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    settingsDs.createResolver('MutationUpsertSettingsResolver', {
      typeName: 'Mutation',
      fieldName: 'upsertSettings',
      code: aws_appsync.Code.fromAsset('lib/resolvers/upsertSettings.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Courses

    const coursesTable = new aws_dynamodb.TableV2(this, 'CoursesTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const coursesDs = api.addDynamoDbDataSource('CoursesDataSource', coursesTable);

    coursesDs.createResolver('QueryListCoursesResolver', {
      typeName: 'Query',
      fieldName: 'listCourses',
      requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: aws_appsync.MappingTemplate.dynamoDbResultList(),
    });

    /////////// Students

    const studentsTable = new aws_dynamodb.TableV2(this, 'StudentsTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const studentsDs = api.addDynamoDbDataSource('StudentsDataSource', studentsTable);

    studentsDs.createResolver('QueryListStudentsResolver', {
      typeName: 'Query',
      fieldName: 'listStudents',
      requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: aws_appsync.MappingTemplate.dynamoDbResultList(),
    });

    /////////// AssessTemplates

    const assessTemplatesTable = new aws_dynamodb.TableV2(this, 'AssessTemplatesTable', {
      partitionKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const assessTemplateDs = api.addDynamoDbDataSource('AssessTemplatesDataSource', assessTemplatesTable);

    assessTemplateDs.createResolver('MutationCreateAssessTemplateResolver', {
      typeName: 'Mutation',
      fieldName: 'createAssessTemplate',
      code: aws_appsync.Code.fromAsset('lib/resolvers/createAssessTemplate.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Assessments

    const assessmentsTable = new aws_dynamodb.TableV2(this, 'AssessmentsTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      globalSecondaryIndexes: [
        {
          indexName: 'id-only',
          partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const assessmentsDs = api.addDynamoDbDataSource('AssessmentsDataSource', assessmentsTable);

    assessmentsDs.createResolver('MutationUpsertAssessmentResolver', {
      typeName: 'Mutation',
      fieldName: 'upsertAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/upsertAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    assessmentsDs.createResolver('QueryListAssessmentsResolver', {
      typeName: 'Query',
      fieldName: 'listAssessments',
      requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: aws_appsync.MappingTemplate.dynamoDbResultList(),
    });

    assessmentsDs.createResolver('QueryAssessmentResolver', {
      typeName: 'Query',
      fieldName: 'getAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/getAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// StudentAssessments

    const studentAssessmentsTable = new aws_dynamodb.TableV2(this, 'StudentAssessmentsTable', {
      partitionKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'parentAssessId', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const studentAssessmentsDs = api.addDynamoDbDataSource('StudentAssessmentsDataSource', studentAssessmentsTable);

    studentAssessmentsDs.createResolver('MutationUpsertStudentAssessmentResolver', {
      typeName: 'Mutation',
      fieldName: 'upsertStudentAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/upsertStudentAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    studentAssessmentsDs.createResolver('QueryListStudentAssessmentsResolver', {
      typeName: 'Query',
      fieldName: 'listStudentAssessments',
      requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: aws_appsync.MappingTemplate.dynamoDbResultList(),
    });

    studentAssessmentsDs.createResolver('QueryStudentAssessmentResolver', {
      typeName: 'Query',
      fieldName: 'getStudentAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/getStudentAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    assessmentsDs.createResolver('ParentAssessmentResolver', {
      typeName: 'StudentAssessment',
      fieldName: 'assessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/getParentAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    const NAMESPACE = 'genassess-rag';
    const QUESTIONS_GENERATOR_NAME = 'QuestionsGenerator';
    const questionGeneratorRole = new aws_iam.Role(this, `${QUESTIONS_GENERATOR_NAME}Role`, {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });

    //Add Bedrock permissions on the Lambda function
    //TODO scope it down to what's required
    questionGeneratorRole.addToPolicy(
      new PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['bedrock:*'],
      })
    );

    const bucket = new s3.Bucket(this, 'QGenerationBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
    });

    // Creating the log group.
    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `/${NAMESPACE}/${cdk.Stack.of(this).stackName}/middlewares/${QUESTIONS_GENERATOR_NAME}/${this.node.addr}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const questionsGenerator = new NodejsFunction(this, QUESTIONS_GENERATOR_NAME, {
      description: 'Generates questions',
      entry: path.resolve(__dirname, 'questions-generation', 'lambdas', 'event-handler', 'index.ts'),
      memorySize: 512,
      role: questionGeneratorRole,
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      timeout: Duration.minutes(15),
      logGroup: logGroup,
      environment: {
        POWERTOOLS_SERVICE_NAME: 'questions-generator',
        POWERTOOLS_METRICS_NAMESPACE: NAMESPACE,
        Q_GENERATION_BUCKET: bucket.bucketName,
        ASSESSMENTS_TABLE: assessmentsTable.tableName
      },
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-s3', '@aws-sdk/client-sns'],
      },
    });
    bucket.grantRead(questionsGenerator);
    assessmentsTable.grantReadData(questionsGenerator);

    let lambdaRestApi = new LambdaRestApi(this, 'myapi', {
      handler: questionsGenerator,
    });

    /////////// Publish Assessment

    const publishFn = new aws_lambda_nodejs.NodejsFunction(this, 'PublishFn', {
      entry: 'lib/lambdas/publishAssessment.ts',
      environment: {
        region: this.region,
        studentsTable: studentsTable.tableName,
        studentAssessmentsTable: studentAssessmentsTable.tableName,
        assessmentsTable: assessmentsTable.tableName,
      },
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-dynamodb'],
      },
    });
    studentsTable.grantReadData(publishFn);
    assessmentsTable.grantReadWriteData(publishFn);
    studentAssessmentsTable.grantReadWriteData(publishFn);
    const publishAssessmentDs = api.addLambdaDataSource('PublishAssessmentDataSource', publishFn);

    publishAssessmentDs.createResolver('PublishAssessmentResolver', {
      typeName: 'Query',
      fieldName: 'publishAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/publishAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Create KnowledgeBase

    const createKnowledgeBaseFn = new aws_lambda_nodejs.NodejsFunction(this, 'KnowledgeBaseFn', {
      entry: 'lib/lambdas/dummy.ts',
    });
    const createKnowledgeBaseDs = api.addLambdaDataSource('CreateKnowledgeBaseDs', createKnowledgeBaseFn);

    createKnowledgeBaseDs.createResolver('CreateKnowledgeBaseResolver', {
      typeName: 'Query',
      fieldName: 'createKnowledgeBase',
      code: aws_appsync.Code.fromAsset('lib/resolvers/createKnowledgeBase.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Generate Assessment

    const generateAssessmentFn = new aws_lambda_nodejs.NodejsFunction(this, 'GenerateAssessmentFn', {
      entry: 'lib/lambdas/dummy.ts',
    });
    const generateAssessmentDs = api.addLambdaDataSource('GenerateAssessmentDs', generateAssessmentFn);

    generateAssessmentDs.createResolver('GenerateAssessmentResolver', {
      typeName: 'Query',
      fieldName: 'generateAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/generateAssessment.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    this.api = api;
  }
}
