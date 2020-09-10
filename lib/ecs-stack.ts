import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import {VpcStack} from "./vpc-stack";
import {FargateService} from "@aws-cdk/aws-ecs";
import {configEnv} from "../env";
import {SqsStack} from "./sqs-stack";
import {QueueProcessingFargateService} from "@aws-cdk/aws-ecs-patterns";

export interface EcsStackProps extends cdk.StackProps {
  vpcStack: VpcStack,
  sqsStack: SqsStack,
}

export class EcsStack extends cdk.Stack {

  public cluster: ecs.ICluster

  constructor(scope: cdk.Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('stage');
    configEnv(environment);

    // Logging
    const logDriver = new ecs.AwsLogDriver({
      logGroup: new logs.LogGroup(this, 'LogGroup', {
        logGroupName: 'MessageConsumerEcs',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      streamPrefix: 'MessageConsumerEcs',
    });

    // ECS Fargate

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpcStack.vpc,
      clusterName: 'message-consumer-cluster',
    });

    // NOTE: Plain Fargate Service settings
    // const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
    //   memoryLimitMiB: 1024,
    //   cpu: 256,
    // });
    // const container = taskDef.addContainer('Container', {
    //   image: ecs.ContainerImage.fromRegistry('otajisan/spring-aws-sqs-consumer-example'),
    //   memoryLimitMiB: 256,
    //   logging: logDriver,
    //   environment: {
    //     'AWS_CREDENTIALS_ACCESS_KEY': `${process.env.AWS_ACCESS_KEY_ID}`,
    //     'AWS_CREDENTIALS_SECRET_KEY': `${process.env.AWS_SECRET_ACCESS_KEY}`,
    //     'AWS_ACCESS_KEY_ID': `${process.env.AWS_ACCESS_KEY_ID}`,
    //     'AWS_SECRET_ACCESS_KEY': `${process.env.AWS_SECRET_ACCESS_KEY}`
    //   },
    // });
    //
    // const service = new FargateService(this, 'FargateService', {
    //   serviceName: 'message-consumer-service',
    //   cluster: this.cluster,
    //   taskDefinition: taskDef,
    // });
    //
    // // auto scaling settings by metrics
    // const scalingSteps = [{upper: 0, change: -1}, {lower: 50, change: +1}, {lower: 100, change: +2}];
    // service.autoScaleTaskCount({
    //   minCapacity: 0,
    //   maxCapacity: 3,
    // }).scaleOnMetric('', {
    //   metric: props.sqsStack.queue.metricApproximateNumberOfMessagesVisible(),
    //   scalingSteps: scalingSteps,
    // });

    // NOTE: use template
    new QueueProcessingFargateService(this, 'SQSFargateService', {
      serviceName: 'sqs-message-consumer-service',
      cluster: this.cluster,
      image: ecs.ContainerImage.fromRegistry('otajisan/spring-aws-sqs-consumer-example'),
      cpu: 256,
      memoryLimitMiB: 1024,
      logDriver: logDriver,
      environment: {
        'AWS_CREDENTIALS_ACCESS_KEY': `${process.env.AWS_ACCESS_KEY_ID}`,
        'AWS_CREDENTIALS_SECRET_KEY': `${process.env.AWS_SECRET_ACCESS_KEY}`,
        'AWS_ACCESS_KEY_ID': `${process.env.AWS_ACCESS_KEY_ID}`,
        'AWS_SECRET_ACCESS_KEY': `${process.env.AWS_SECRET_ACCESS_KEY}`
      },
      queue: props.sqsStack.queue,
      desiredTaskCount: 0,
      maxScalingCapacity: 3,
      maxReceiveCount: 10,
      scalingSteps: [
        {upper: 0, change: -1},
        {lower: 1, upper: 10, change: +1},
        {lower: 10, upper: 20, change: +2},
        {lower: 20, change: +3},
      ],
    });

    cdk.Tags.of(this).add('ServiceName', 'message-service')
  }
}
