import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import {PythonFunction} from '@aws-cdk/aws-lambda-python';
import * as events from '@aws-cdk/aws-events';
import * as iam from '@aws-cdk/aws-iam';
import * as targets from '@aws-cdk/aws-events-targets';
import {VpcStack} from './vpc-stack';
import {SqsStack} from './sqs-stack';


export interface LambdaStackProps extends cdk.StackProps {
  vpcStack: VpcStack,
  sqsStack: SqsStack,
}

export class LambdaStack extends cdk.Stack {
  public lambdaFn: lambda.IFunction

  constructor(scope: cdk.Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Lambda
    this.lambdaFn = new PythonFunction(this, 'Lambda', {
      vpc: props.vpcStack.vpc,
      functionName: 'message-sender',
      entry: 'lambda/message-sender',
      handler: 'handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(30),
    });

    // Cloud Watch Event
    const rule = new events.Rule(this, 'SendMessageRule', {
      ruleName: 'send-message',
      schedule: events.Schedule.cron({
        minute: '*/10',
        hour: '*',
        day: '*',
        month: '*',
        year: '*',
      }),
      targets: [
        new targets.LambdaFunction(this.lambdaFn),
      ],
    });

    // grant permission to CloudWatch Event
    this.lambdaFn.addPermission(`${id}Permission`, {
      principal: new iam.ServicePrincipal('events.amazonaws.com').grantPrincipal,
      sourceArn: rule.ruleArn
    });

    // grant permission to SQS
    this.lambdaFn.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'sqs:SendMessage',
        'sqs:SendMessageBatch',
        'sqs:GetQueueAttributes',
        'sqs:GetQueueUrl',
      ],
      resources: [props.sqsStack.queueArn]
    }));
  }
}
