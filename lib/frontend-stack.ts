import { DockerImage, Duration, Fn, NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { AllowedMethods, HeadersReferrerPolicy } from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as childProcess from 'child_process';
import * as fsExtra from 'fs-extra';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { NagSuppressions } from "cdk-nag";

export interface FrontendStackProps extends NestedStackProps {
  isDev?: boolean;
  isProd?: boolean;
  domain?: string;
  graphqlUrl: string;
}

export class FrontendStack extends NestedStack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;
  public readonly assetDeployment: s3deploy.BucketDeployment;
  public readonly applicationURL: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);
    const { domain, isProd, graphqlUrl } = props;
    let domainNames: string[] | undefined;
    let certificate: acm.ICertificate | undefined;
    let hostedZone: route53.PublicHostedZone | undefined;

    NagSuppressions.addStackSuppressions(this, [
      {id: 'AwsSolutions-IAM4', reason: 'Using standard managed policies (AWSLambdaBasicExecutionRole)'}
    ]);

    const frontS3AccessLogBucket = new s3.Bucket(this, 'frontS3AccessLogBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true
    });

    this.bucket = new s3.Bucket(this, 'frontendBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      serverAccessLogsBucket: frontS3AccessLogBucket
    });

    const accessLogBucket = new s3.Bucket(this, 'frontAccessLogBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true,
      versioned: true
    });

    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'FrontResponsePolicy', {
      securityHeadersBehavior: {
        strictTransportSecurity: { accessControlMaxAge: Duration.seconds(47304000), includeSubdomains: true, preload: true, override: true },
        contentSecurityPolicy: {
          contentSecurityPolicy: "default-src 'self' *.amazoncognito.com *.amazonaws.com; font-src 'self' data:; img-src 'self' data: https://internal-cdn.amazon.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests;",
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        xssProtection: { protection: true, modeBlock: true, override: true },
      },
    });

    const distribution = new cloudfront.Distribution(this, 'dist', {
      comment: 'Planning Pipeline Distribution',
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: responseHeadersPolicy
      },
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        { httpStatus: 403, responsePagePath: '/index.html', responseHttpStatus: 200 },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/' },
      ],
      defaultRootObject: 'index.html',
      enableLogging: true,
      logBucket: accessLogBucket,
    });

    distribution.addBehavior('/graphql', new HttpOrigin(Fn.select(2, Fn.split('/', graphqlUrl))), {
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      allowedMethods: AllowedMethods.ALLOW_ALL, // allow POST for graphql
      responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'APIResponsePolicy', {
        securityHeadersBehavior: {
          strictTransportSecurity: { accessControlMaxAge: Duration.seconds(47304000), includeSubdomains: true, preload: true, override: true },
          contentTypeOptions: { override: true },
          xssProtection: { protection: true, modeBlock: true, override: true },
          referrerPolicy: {referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true }
        },
        corsBehavior: {
          accessControlAllowHeaders: ['*'],
          accessControlAllowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
          accessControlAllowCredentials: false,
          originOverride: true,
          accessControlAllowOrigins: [domain ? `https://${domain}` : '*'] // '*' is for dev / localhost
        },
      })
    });

    const execOptions: childProcess.ExecSyncOptions = { stdio: 'inherit' };
    this.assetDeployment = new s3deploy.BucketDeployment(this, 'frontendDeployment', {
      retainOnDelete: true,
      sources: [
        s3deploy.Source.asset('ui', {
          bundling: {
            image: DockerImage.fromRegistry('alpine'),
            command: ['sh', '-c', 'echo "Docker build not supported. Please install esbuild."'],
            local: {
              tryBundle(outputDir: string) {
                try {
                  childProcess.execSync('esbuild --version', execOptions);
                  childProcess.execSync('cd ui/node_modules || (cd ui && npm ci)', execOptions);
                  childProcess.execSync('cd ui && npm run build', execOptions);

                  fsExtra.copySync('ui/out', outputDir);
                  return true;
                } catch {
                  return false;
                }
              },
            },
          },
        }),
      ],
      exclude: ['config.json'],
      destinationBucket: this.bucket,
      distribution,
    });

    if (hostedZone) {
      new route53.ARecord(this, 'ARecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });
    }

    this.distribution = distribution;
    if (domain) {
      this.applicationURL = `https://${domain}`;
    } else {
      this.applicationURL = `https://${distribution.distributionDomainName}`;
    }
  }
}
