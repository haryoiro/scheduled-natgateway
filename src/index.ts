import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ScheduledNatGatewayProps {
  readonly publicSubnetId: string;
  readonly privateSubnetIds: string[];
  readonly createSchedule: string;
  readonly deleteSchedule: string;
  /**
   * Optional prefix for resource names to avoid conflicts
   * @default - No prefix
   */
  readonly namePrefix?: string;
  /**
   * Optional suffix for resource names to avoid conflicts
   * @default - No suffix
   */
  readonly nameSuffix?: string;
}

export class ScheduledNatGateway extends Construct {
  constructor(scope: Construct, id: string, props: ScheduledNatGatewayProps) {
    super(scope, id);

    const prefix = props.namePrefix || '';
    const suffix = props.nameSuffix || '';
    const baseName = 'scheduled-nat';

    const functionName = `${prefix}${prefix ? '-' : ''}ScheduledNatGatewayFunction${suffix ? '-' : ''}${suffix}`;
    const eipTagName = `${prefix}${prefix ? '-' : ''}${baseName}-eip${suffix ? '-' : ''}${suffix}`;
    const natGatewayTagName = `${prefix}${prefix ? '-' : ''}${baseName}-gateway${suffix ? '-' : ''}${suffix}`;

    // Lambda function to create/delete the NAT Gateway
    const lambdaFn = new lambda.Function(this, 'ScheduledNatGatewayFunction', {
      functionName: functionName,
      code: lambda.Code.fromAsset(path.join(__dirname, './functions')),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_24_X,
      timeout: cdk.Duration.seconds(600),
      environment: {
        PUBLIC_SUBNET_ID: props.publicSubnetId,
        PRIVATE_SUBNET_IDS: props.privateSubnetIds.join(','),
        EIP_TAG_NAME: eipTagName,
        NAT_GATEWAY_TAG_NAME: natGatewayTagName,
      },
    });

    lambdaFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ec2:CreateNatGateway', 'ec2:DeleteNatGateway'],
        resources: ['*'],
      }),
    );
    lambdaFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'ec2:DescribeNatGateways',
          'ec2:DescribeRouteTables',
          'ec2:DescribeAddresses',
          'ec2:DescribeVpcs',
        ],
        resources: ['*'],
      }),
    );
    lambdaFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'ec2:AssociateRouteTable',
          'ec2:CreateRoute',
          'ec2:ReplaceRoute',
          'ec2:DeleteRoute',
        ],
        resources: ['*'],
      }),
    );
    lambdaFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ec2:AllocateAddress', 'ec2:ReleaseAddress'],
        resources: ['*'],
      }),
    );
    lambdaFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ec2:CreateTags'],
        resources: ['*'],
      }),
    );
    // CloudWatch Event Rule to trigger the Lambda function on a schedule
    const createRuleName = `${prefix}${prefix ? '-' : ''}CreateNatGateway${suffix ? '-' : ''}${suffix}`;
    const deleteRuleName = `${prefix}${prefix ? '-' : ''}DeleteNatGateway${suffix ? '-' : ''}${suffix}`;

    const rule = new events.Rule(this, 'ScheduledNatGatewayRule', {
      ruleName: createRuleName,
      schedule: events.Schedule.expression(`cron(${props.createSchedule})`),
    });
    rule.addTarget(
      new targets.LambdaFunction(lambdaFn, {
        event: events.RuleTargetInput.fromObject({ operation: 'create' }),
      }),
    );

    const rule2 = new events.Rule(this, 'ScheduledNatGatewayRule2', {
      ruleName: deleteRuleName,
      schedule: events.Schedule.expression(`cron(${props.deleteSchedule})`),
    });
    rule2.addTarget(
      new targets.LambdaFunction(lambdaFn, {
        event: events.RuleTargetInput.fromObject({ operation: 'delete' }),
      }),
    );
  }
}
