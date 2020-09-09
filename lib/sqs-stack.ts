import * as cdk from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';


export class SqsStack extends cdk.Stack {

  public readonly queueArn: string;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'Queue', {
      queueName: 'send-message-queue',
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    this.queueArn = queue.queueArn;
  }
}
