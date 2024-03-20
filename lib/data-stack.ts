import { Construct } from 'constructs';
import {
  NestedStack,
  NestedStackProps,
  aws_dynamodb,
  aws_appsync,
  RemovalPolicy,
  aws_cognito,
  aws_logs,
  aws_rds,
  custom_resources,
} from 'aws-cdk-lib';

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

    /////////// Coarses

    const coarsesTable = new aws_dynamodb.TableV2(this, 'CoarsesTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const coarsesDs = api.addDynamoDbDataSource('CoarsesDataSource', coarsesTable);

    coarsesDs.createResolver('QueryListCoarsesResolver', {
      typeName: 'Query',
      fieldName: 'listCoarses',
      requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: aws_appsync.MappingTemplate.dynamoDbResultList(),
    });

    /////////// Classes

    const classesTable = new aws_dynamodb.TableV2(this, 'ClassesTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const classesDs = api.addDynamoDbDataSource('ClassesDataSource', classesTable);

    classesDs.createResolver('QueryListClassesResolver', {
      typeName: 'Query',
      fieldName: 'listClasses',
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
      partitionKey: { name: 'userId', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
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

    // assessmentsDs.createResolver('ParentAssessmentResolver', {
    //   typeName: 'StudentAssessment',
    //   fieldName: 'assessment',
    //   code: aws_appsync.Code.fromAsset('lib/resolvers/getParentAssessment.js'),
    //   runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    // });

    this.api = api;
  }
}
