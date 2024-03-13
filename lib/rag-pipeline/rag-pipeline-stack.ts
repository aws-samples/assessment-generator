import { CfnOutput, NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { OpenSearchDomain } from '@project-lakechain/opensearch-domain';
import { S3EventTrigger } from '@project-lakechain/s3-event-trigger';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CacheStorage } from '@project-lakechain/core';
import { PdfTextConverter } from '@project-lakechain/pdf-text-converter';
import { PandocTextConverter } from '@project-lakechain/pandoc-text-converter';
import { TranscribeAudioProcessor } from '@project-lakechain/transcribe-audio-processor';
import { AnthropicTextModel, AnthropicTextProcessor } from '@project-lakechain/bedrock-text-processors';
import { RecursiveCharacterTextSplitter } from '@project-lakechain/recursive-character-text-splitter';
import { TitanEmbeddingProcessor } from '@project-lakechain/bedrock-embedding-processors';
import {
  OpenSearchVectorIndexDefinition,
  OpenSearchVectorStorageConnector,
} from '@project-lakechain/opensearch-vector-storage-connector';

export class RagPipelineStack extends NestedStack {
  public bucket: Bucket;

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

    // The source bucket.
    this.bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true,
    });


    // The cache storage.
    const cache = new CacheStorage(this, 'Cache', {});

    // Create the S3 trigger monitoring the bucket
    // for uploaded objects.
    const trigger = new S3EventTrigger.Builder()
      .withScope(this)
      .withIdentifier('Trigger')
      .withCacheStorage(cache)
      .withBucket(this.bucket)
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
      .build();

    // Display the source bucket information in the console.
    new CfnOutput(this, 'SourceBucket', {
      description: 'The name of the source bucket.',
      value: this.bucket.bucketName,
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
