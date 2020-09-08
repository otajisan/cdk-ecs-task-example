#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkEcsTaskExampleStack } from '../lib/cdk-ecs-task-example-stack';

const app = new cdk.App();
new CdkEcsTaskExampleStack(app, 'CdkEcsTaskExampleStack');
