import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as logs from '@aws-cdk/aws-logs';
import {VpcStack} from "./vpc-stack";

export interface EcsStackProps extends cdk.StackProps {
  vpcStack: VpcStack
}

export class EcsStack extends cdk.Stack {

  public cluster: ecs.ICluster
  public container: ecs.ContainerDefinition

  constructor(scope: cdk.Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    // Logging
    const logDriver = new ecs.AwsLogDriver({
      logGroup: new logs.LogGroup(this, 'LogGroup', {
        logGroupName: 'StepFunctionsECSTaskLog',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      streamPrefix: 'StepFunctionsECSTask',
    });

    // ECS Task (Fargate)
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpcStack.vpc,
      clusterName: 'ExampleCluster',
    });
    const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 256,
    });
    this.container = taskDef.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry('otajisan/spring-batch-kotlin-example'),
      memoryLimitMiB: 256,
      logging: logDriver,
    });

  }
}
