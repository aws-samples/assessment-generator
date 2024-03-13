import * as cdk from 'aws-cdk-lib';
import { CfnOutput, Duration, NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { OpenSearchDomain } from '@project-lakechain/opensearch-domain';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from "path";
import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";


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
const DEFAULT_MEMORY_SIZE = 128;

const NAMESPACE = "genassess";

const DOCUMENT_PROCESSOR_NAME = 'DocumentProcessor';

export class RagPipelineStack extends NestedStack {
  public artifactsUploadBucket: Bucket;
  private DEFAULT_MEMORY_SIZE: number = 128;
  private documentProcessor: NodejsFunction;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    // The VPC in which OpenSearch will be deployed.
    const vpc = this.createVpc('Vpc');

    // The OpenSearch domain.
    const openSearch = new OpenSearchDomain(this, 'Domain', {
      vpc,
      opts: {
        capacity: {
          multiAzWithStandbyEnabled: false,
        },
        zoneAwareness: {
          enabled: false,
        },
      },
    });

    // The source artifactsUploadBucket.
    this.artifactsUploadBucket = new s3.Bucket(this, 'ArtifactsUploadBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
    });

    // The bucket utilised for raw files to be ingested in the KB
    const kbStagingBucket = new s3.Bucket(this, 'KBStorageBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
    });


    // Creating the processing queue with related S3 trigger and DLQ.
    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
    });
    const eventQueue = new sqs.Queue(this, 'Queue', {
      retentionPeriod: cdk.Duration.days(14),
      visibilityTimeout: cdk.Duration.seconds(10),
      deadLetterQueue: {
        maxReceiveCount: 5,
        queue: deadLetterQueue,
      },
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
    });

    this.artifactsUploadBucket.addEventNotification(s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(eventQueue));


    // Creating the log group.
    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `/${NAMESPACE}/${cdk.Stack.of(this).stackName}/middlewares/${DOCUMENT_PROCESSOR_NAME}/${this.node.addr}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.documentProcessor = new NodejsFunction(this, DOCUMENT_PROCESSOR_NAME, {
      description: 'Processes uploaded S3 documents and adds to the KB.',
      entry: path.resolve(__dirname, 'lambdas', 'event-handler', 'index.ts'),
      memorySize: this.DEFAULT_MEMORY_SIZE,
      vpc: vpc,
      timeout: PROCESSING_TIMEOUT,
      runtime: EXECUTION_RUNTIME,
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logGroup: logGroup,
      environment: {
        POWERTOOLS_SERVICE_NAME: "document-processor",
        POWERTOOLS_METRICS_NAMESPACE: NAMESPACE,
        // SNS_TARGET_TOPIC: this.eventBus.topicArn,
      },
      bundling: {
        minify: true,
        externalModules: [
          '@aws-sdk/client-s3',
          '@aws-sdk/client-sns',
        ],
      },
    });

    this.documentProcessor.addEventSource(new SqsEventSource(eventQueue, {
      batchSize: 10,
      maxBatchingWindow: Duration.minutes(1),
      reportBatchItemFailures: true,
    }));


    /*

        // Create the S3 trigger monitoring the artifactsUploadBucket
        // for uploaded objects.
        const trigger = new S3EventTrigger.Builder()
          .withScope(this)
          .withIdentifier('Trigger')
          .withCacheStorage(cache)
          .withBucket(this.artifactsUploadBucket)
          .build();


        // Convert PDF documents to text.
        const pdfConverter = new PdfTextConverter.Builder()
          .withScope(this)
          .withIdentifier('PdfConverter')
          .withCacheStorage(cache)
          .withSource(trigger)
          .build();

        // Convert text-oriented documents (Docx, Markdown, HTML, etc) to text.
        const pandocConverter = new PandocTextConverter.Builder()
          .withScope(this)
          .withIdentifier('PandocConverter')
          .withCacheStorage(cache)
          .withSource(trigger)
          .build();

        // Convert audio recordings to text.
        const transcribe = new TranscribeAudioProcessor.Builder()
          .withScope(this)
          .withIdentifier('TranscribeTextProcessor')
          .withCacheStorage(cache)
          .withSource(trigger)
          .withOutputFormats('vtt')
          .build();

        // Convert the VTT transcription file to a summarized
        // version of the conversation.
        const textProcessor = new AnthropicTextProcessor.Builder()
          .withScope(this)
          .withIdentifier('TextProcessor')
          .withCacheStorage(cache)
          .withSource(transcribe)
          .withModel(AnthropicTextModel.ANTHROPIC_CLAUDE_INSTANT_V1)
          .withRegion('us-east-1')
          .withPrompt(`
            Give a very comprehensive description of the content of this transcription file with these constraints:
            - Summarize all the data points of the transcript.
            - Focus only on the content of the transcript, not the formatting.
            - Don't say "This is a transcription of an audio file" or anything similar, just output the summary.
            - The output should be spread in multiple paragraphs.
          `)
          .build();

        ///////////////////////////////////////////
        //////////     Text Splitter     //////////
        ///////////////////////////////////////////

        // Split the text into chunks.
        const textSplitter = new RecursiveCharacterTextSplitter.Builder()
          .withScope(this)
          .withIdentifier('RecursiveCharacterTextSplitter')
          .withCacheStorage(cache)
          .withChunkSize(4096)
          .withSources([
            trigger,
            pdfConverter,
            pandocConverter,
            textProcessor,
          ])
          .build();

        /////////////////////////////////////
        ////   Embeddings with Bedrock   ////
        /////////////////////////////////////

        // Create embeddings for each chunk of text using
        // the Amazon Titan embedding model hosted on Amazon Bedrock.
        const bedrockProcessor = new TitanEmbeddingProcessor.Builder()
          .withScope(this)
          .withIdentifier('BedrockEmbeddingProcessor')
          .withCacheStorage(cache)
          .withSource(textSplitter)
          .withRegion('us-east-1')
          .build();

        ///////////////////////////////////////////
        ////     Pipeline Storage Providers    ////
        ///////////////////////////////////////////

        // Vector storage for text.
        new OpenSearchVectorStorageConnector.Builder()
          .withScope(this)
          .withIdentifier('TextVectorStorage')
          .withCacheStorage(cache)
          .withEndpoint(openSearch.domain)
          .withSource(bedrockProcessor)
          .withVpc(vpc)
          .withIncludeDocument(true)
          .withIndex(new OpenSearchVectorIndexDefinition.Builder()
            .withIndexName('text-vectors')
            .withKnnMethod('hnsw')
            .withKnnEngine('nmslib')
            .withSpaceType('l2')
            .withDimensions(1536)
            .withParameters({ 'ef_construction': 512, 'm': 16 })
            .build(),
          )
          .build();*/

    // Display the source artifactsUploadBucket information in the console.
    new CfnOutput(this, 'SourceBucket', {
      description: 'The name of the source artifactsUploadBucket.',
      value: this.artifactsUploadBucket.bucketName,
    });

    // Display the OpenSearch endpoint.
    new CfnOutput(this, 'OpenSearchEndpoint', {
      description: 'The endpoint of the OpenSearch domain.',
      value: `https://${openSearch.domain.domainEndpoint}`,
    });
  }

  /**
   * @param id the VPC identifier.
   * @returns a new VPC with a public, private and isolated
   * subnets for the pipeline.
   */
  private createVpc(id: string): ec2.IVpc {
    return (new ec2.Vpc(this, id, {
      enableDnsSupport: true,
      enableDnsHostnames: true,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/20'),
      maxAzs: 1,
      subnetConfiguration: [{
        name: 'public',
        subnetType: ec2.SubnetType.PUBLIC,
        cidrMask: 28,
      }, {
        name: 'private',
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        cidrMask: 24,
      }, {
        name: 'isolated',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        cidrMask: 24,
      }],
    }));
  }
}
