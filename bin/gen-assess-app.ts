#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CfnGuardValidator } from '@cdklabs/cdk-validator-cfnguard';
import { GenAssessStack } from '../lib/gen-assess-stack';

const app = new cdk.App({
  policyValidationBeta1: [
    new CfnGuardValidator({
      disabledRules: ['ct-lambda-pr-3'],
    }),
  ],
});

new GenAssessStack(app, 'GenAssessStack', {});
