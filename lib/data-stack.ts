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
  userpool: aws_cognito.UserPool;
}

export class DataStack extends NestedStack {
  public readonly api: aws_appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    const { userpool } = props;

    // const summaryTable = new aws_dynamodb.TableV2(this, 'SummaryTable', {
    //   partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
    //   removalPolicy: RemovalPolicy.DESTROY,
    // });

    const api = new aws_appsync.GraphqlApi(this, 'Api', {
      name: 'FeedbackCollectionApi',
      definition: aws_appsync.Definition.fromFile('lib/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: aws_appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool: userpool },
        },
      },
      logConfig: { retention: aws_logs.RetentionDays.ONE_WEEK, fieldLogLevel: aws_appsync.FieldLogLevel.ALL },
    });

    // const summaryDS = api.addDynamoDbDataSource('SummaryDataSource', summaryTable);

    // summaryDS.createResolver('QueryGetSummariesResolver', {
    //   typeName: 'Query',
    //   fieldName: 'listSummaries',
    //   requestMappingTemplate: aws_appsync.MappingTemplate.dynamoDbScanTable(),
    //   responseMappingTemplate: aws_appsync.MappingTemplate.dynamoDbResultList(),
    // });

    // summaryDS.createResolver('QueryGetSummaryResolver', {
    //   typeName: 'Query',
    //   fieldName: 'getSummary',
    //   code: aws_appsync.Code.fromInline(`
    //     export function request(ctx) {
    //       const { id } = ctx.args;
    //       return {
    //         operation: 'GetItem',
    //         key: util.dynamodb.toMapValues({ id }),
    //       };
    //     }
    //     export function response(ctx) {
    //       return ctx.result;
    //     }
    //   `),
    //   runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    // });

    // summaryDS.createResolver('FeedbackSummaryResolver', {
    //   typeName: 'Feedback',
    //   fieldName: 'summary',
    //   code: aws_appsync.Code.fromInline(`
    //     export function request(ctx) {
    //       const { summaryid } = ctx.source;
    //       return {
    //         operation: 'GetItem',
    //         key: util.dynamodb.toMapValues({ id: summaryid }),
    //       };
    //     }
    //     export function response(ctx) {
    //       return ctx.result;
    //     }
    //   `),
    //   runtime: aws_appsync.FunctionRuntime.JS_1_0_0,
    // });

    this.api = api;
  }
}
