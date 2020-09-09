#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {VpcStack} from "../lib/vpc-stack";
import {LambdaStack} from "../lib/lambda-stack";
import {SqsStack} from "../lib/sqs-stack";
import {ApiGatewayStack} from "../lib/apigateway-stack";

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack');
const sqsStack = new SqsStack(app, 'SqsStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  vpcStack: vpcStack,
  sqsStack: sqsStack,
});
new ApiGatewayStack(app, 'ApiGatewayStack', {lambdaStack: lambdaStack});
//const ecsStack = new EcsStack(app, 'EcsStack', {vpcStack: vpcStack});
//new CdkEcsTaskExampleStack(app, 'CdkEcsTaskExampleStack', {});
