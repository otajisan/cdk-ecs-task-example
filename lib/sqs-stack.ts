import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as sqs from '@aws-cdk/aws-sqs';


export class SqsStack extends cdk.Stack {

  public readonly queue: sqs.Queue;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS
    this.queue = new sqs.Queue(this, 'Queue', {
      queueName: 'send-message-queue',
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    // CloudWatch
    const metric = this.queue.metric('ApproximateNumberOfMessagesVisible');

    const alarm = new cloudwatch.Alarm(this, 'SQSAlarm', {
      metric: metric,
      threshold: 10,
      evaluationPeriods: 3,
      datapointsToAlarm: 2
    });

    // monitoring dashboard settings
    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: 'SQSMessageDashboard'
    });
    dashboard.addWidgets(new cloudwatch.GraphWidget({
      title: 'queued message count',
      left: [metric],
      right: [metric]
    }));

    dashboard.addWidgets(new cloudwatch.AlarmWidget({
      title: 'message alarm widget',
      alarm
    }));
  }
}
