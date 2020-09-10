import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import {VpcStack} from "./vpc-stack";
import {FargateService} from "@aws-cdk/aws-ecs";
import {configEnv} from "../env";

export interface EcsStackProps extends cdk.StackProps {
  vpcStack: VpcStack
}

export class EcsStack extends cdk.Stack {

  public cluster: ecs.ICluster
  public container: ecs.ContainerDefinition

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
    const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 256,
    });
    this.container = taskDef.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry('otajisan/spring-aws-sqs-consumer-example'),
      memoryLimitMiB: 256,
      logging: logDriver,
      environment: {
        'AWS_CREDENTIALS_ACCESS_KEY': `${process.env.AWS_ACCESS_KEY_ID}`,
        'AWS_CREDENTIALS_SECRET_KEY': `${process.env.AWS_SECRET_ACCESS_KEY}`,
        'AWS_ACCESS_KEY_ID': `${process.env.AWS_ACCESS_KEY_ID}`,
        'AWS_SECRET_ACCESS_KEY': `${process.env.AWS_SECRET_ACCESS_KEY}`
      },
    });

    new FargateService(this, 'FargateService', {
      serviceName: 'message-consumer-service',
      cluster: this.cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
    });

    cdk.Tags.of(this).add('ServiceName', 'message-service')
  }
}
