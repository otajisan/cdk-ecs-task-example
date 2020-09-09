import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import {LambdaStack} from "./lambda-stack";

export interface ApiGatewayStackProps extends cdk.StackProps {
  lambdaStack: LambdaStack,
}

export class ApiGatewayStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const restApi = new apigw.RestApi(this, 'SendMessageAPI', {
      restApiName: 'SendMessageAPI',
      description: 'Send Message Queue by Lambda'
    })

    const integration = new apigw.LambdaIntegration(props.lambdaStack.lambdaFn);

    restApi.root.addResource('post')
      .addMethod('POST', integration, {
        methodResponses: [{statusCode: '200'}]
      })
  }
}
