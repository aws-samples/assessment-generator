// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {
  aws_appsync,
  aws_cognito,
  aws_dynamodb,
  aws_iam,
  aws_lambda_nodejs,
  aws_logs,
  Duration,
  NestedStack,
  NestedStackProps,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ManagedPolicy, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { KeyCondition } from 'aws-cdk-lib/aws-appsync';

export const feedbacksDbName = 'feedbacks';
export const feedbacksTableName = 'feedbacks';

interface DataStackProps extends NestedStackProps {
  userPool: aws_cognito.UserPool;
  artifactsUploadBucket: s3.Bucket;
  documentProcessorLambda: NodejsFunction;
  postConfirmationLambda: NodejsFunction;
  kbTable: TableV2;
}

export class DataStack extends NestedStack {
  public readonly api: aws_appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    const { userPool, kbTable } = props;
    const artifactsUploadBucket = props.artifactsUploadBucket;
    const documentProcessorLambda = props.documentProcessorLambda;

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
      xrayEnabled: true,
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

    coursesDs.createResolver('MutationUpsertCourseResolver', {
      typeName: 'Mutation',
      fieldName: 'upsertCourse',
      code: aws_appsync.Code.fromAsset('lib/resolvers/upsertCourse.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    coursesDs.createResolver('AssessmentCourseResolver', {
      typeName: 'Assessment',
      fieldName: 'course',
      code: aws_appsync.Code.fromAsset('lib/resolvers/getCourse.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Students

    const studentsTable = new aws_dynamodb.TableV2(this, 'StudentsTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const studentsTableParam = new StringParameter(this, 'StudentsTableParameter', {
      parameterName: '/gen-assess/student-table-name',
      stringValue: studentsTable.tableName,
    });
    const policy = new Policy(this, 'lambdaPolicyDdb', {
      statements: [
        new PolicyStatement({
          actions: ['dynamodb:*'],
          resources: [studentsTable.tableArn],
        }),
      ],
    });
    if (!props.postConfirmationLambda.role) {
      throw new Error('err');
    }
    policy.attachToRole(props.postConfirmationLambda.role);

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

    assessTemplateDs.createResolver('QueryListAssessTemplatesResolver', {
      typeName: 'Query',
      fieldName: 'listAssessTemplates',
      code: aws_appsync.Code.fromAsset('lib/resolvers/listAssessTemplates.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Assessments

    const assessmentsTable = new aws_dynamodb.TableV2(this, 'AssessmentsTable', {
      partitionKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
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
      code: aws_appsync.Code.fromAsset('lib/resolvers/listAssessments.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
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
      code: aws_appsync.Code.fromAsset('lib/resolvers/listStudentAssessments.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    studentAssessmentsDs.createResolver('QueryListMyStudentAssessmentsResolver', {
      typeName: 'Query',
      fieldName: 'listMyStudentAssessments',
      requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbQuery(KeyCondition.eq('userId', 'studentId')),
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

    const QUESTIONS_GENERATOR_NAME = 'QuestionsGenerator';
    const NAMESPACE = 'genassess-rag';
    const assessmentLambdaRole = new aws_iam.Role(this, `AssessmentLambdaRole`, {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });

    //Add Bedrock permissions on the Lambda function
    //TODO scope it down to what's required
    assessmentLambdaRole.addToPolicy(
      new PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['bedrock:*'],
      })
    );

    // Creating the log group.
    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `/${NAMESPACE}/${cdk.Stack.of(this).stackName}/${QUESTIONS_GENERATOR_NAME}/${this.node.addr}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const questionsGenerator = new NodejsFunction(this, QUESTIONS_GENERATOR_NAME, {
      description: 'Generates questions',
      entry: path.resolve(__dirname, 'questions-generation', 'lambdas', 'event-handler', 'index.ts'),
      memorySize: 512,
      role: assessmentLambdaRole,
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      timeout: Duration.minutes(15),
      logGroup: logGroup,
      environment: {
        POWERTOOLS_SERVICE_NAME: 'questions-generator',
        POWERTOOLS_METRICS_NAMESPACE: NAMESPACE,
        Q_GENERATION_BUCKET: artifactsUploadBucket.bucketName,
        ASSESSMENTS_TABLE: assessmentsTable.tableName,
        KB_TABLE: kbTable.tableName,
        ASSESS_TEMPLATE_TABLE: assessTemplatesTable.tableName,
      },
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-s3', '@aws-sdk/client-sns'],
      },
    });
    artifactsUploadBucket.grantRead(questionsGenerator);
    assessmentsTable.grantReadWriteData(questionsGenerator);
    kbTable.grantReadData(questionsGenerator);
    assessTemplatesTable.grantReadData(questionsGenerator);

    const qaGeneratorWrapper = new NodejsFunction(this, `${QUESTIONS_GENERATOR_NAME}-wrapper`, {
      description: 'Wraps around the Question generator ',
      entry: path.resolve(__dirname, 'questions-generation', 'lambdas', 'wrapper', 'index.ts'),
      memorySize: 512,
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      timeout: Duration.seconds(30),
      environment: {
        POWERTOOLS_SERVICE_NAME: 'questions-generator-wrapper',
        POWERTOOLS_METRICS_NAMESPACE: NAMESPACE,
        QA_LAMBDA_NAME: questionsGenerator.functionName,
        ASSESSMENTS_TABLE: assessmentsTable.tableName,
        ASSESS_TEMPLATE_TABLE: assessTemplatesTable.tableName,
      },
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/client-lambda'],
      },
    });
    questionsGenerator.grantInvoke(qaGeneratorWrapper);
    assessmentsTable.grantReadWriteData(qaGeneratorWrapper);
    assessTemplatesTable.grantReadData(qaGeneratorWrapper);

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
    const createKnowledgeBaseDs = api.addLambdaDataSource('CreateKnowledgeBaseDs', documentProcessorLambda);

    createKnowledgeBaseDs.createResolver('CreateKnowledgeBaseResolver', {
      typeName: 'Mutation',
      fieldName: 'createKnowledgeBase',
      code: aws_appsync.Code.fromAsset('lib/resolvers/invokeLambda.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Generate Assessment
    const generateAssessmentDs = api.addLambdaDataSource('GenerateAssessmentDs', qaGeneratorWrapper);

    generateAssessmentDs.createResolver('GenerateAssessmentResolver', {
      typeName: 'Query',
      fieldName: 'generateAssessment',
      code: aws_appsync.Code.fromAsset('lib/resolvers/lambdaResolver.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    /////////// Grade Assessment

    const gradeAssessmentFn = new NodejsFunction(this, 'GradeAssessmentFn', {
      description: 'Grade Assessment',
      entry: 'lib/lambdas/gradeAssessment.ts',
      memorySize: 512,
      role: assessmentLambdaRole,
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      timeout: Duration.minutes(15),
      environment: {
        POWERTOOLS_SERVICE_NAME: 'assessment-grader',
        POWERTOOLS_METRICS_NAMESPACE: NAMESPACE,
      },
      bundling: {
        minify: true,
      },
    });
    gradeAssessmentFn.addToRolePolicy(
      new PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['bedrock:InvokeModel'],
      })
    );

    const gradeAssessmentDs = api.addLambdaDataSource('GradeAssessmentDs', gradeAssessmentFn);

    new aws_appsync.Resolver(this, 'GradeStudentAssessmentResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'gradeStudentAssessment',
      code: aws_appsync.Code.fromInline(`
          export function request(ctx) {
          return {};
        }

        export function response(ctx) {
          return ctx.prev.result;
        }
      `),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [
        new aws_appsync.AppsyncFunction(this, 'GetParentAssessmentFn', {
          api,
          name: 'getParentAssessmentFn',
          dataSource: assessmentsDs,
          code: aws_appsync.Code.fromAsset('lib/resolvers/getParentAssessment.ts'),
          runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
        }),
        new aws_appsync.AppsyncFunction(this, 'GradeStudentAssessmentFn', {
          api,
          name: 'gradeStudentAssessment',
          dataSource: gradeAssessmentDs,
          requestMappingTemplate: aws_appsync.MappingTemplate.lambdaRequest(),
          responseMappingTemplate: aws_appsync.MappingTemplate.lambdaResult(),
        }),
        new aws_appsync.AppsyncFunction(this, 'UpsertStudentAssessmentFn', {
          api,
          name: 'upsertStudentAssessmentFn',
          dataSource: studentAssessmentsDs,
          code: aws_appsync.Code.fromAsset('lib/resolvers/upsertStudentAssessment.ts'),
          runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
        }),
      ],
    });

    ///////// Bedrock

    const getIngestionJobFn = new NodejsFunction(this, 'GetIngestionJobFn', {
      entry: 'lib/lambdas/getIngestionJob.ts',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
      },
    });
    getIngestionJobFn.addToRolePolicy(
      new PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['bedrock:*'],
      })
    );

    const getIngestionJobDs = api.addLambdaDataSource('GetIngestionJobDs', getIngestionJobFn);

    getIngestionJobDs.createResolver('GetIngestionJobResolver', {
      typeName: 'Query',
      fieldName: 'getIngestionJob',
      code: aws_appsync.Code.fromAsset('lib/resolvers/invokeLambda.ts'),
      runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    });

    this.api = api;
  }
}
