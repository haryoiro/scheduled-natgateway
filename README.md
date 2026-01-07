# Scheduled NAT Gateway CDK Construct

> **Note**: This is a fork of [yayami3/scheduled-natgateway](https://github.com/yayami3/scheduled-natgateway) with additional features and improvements.

This CDK Construct Library provides a cost-effective solution for scheduled NAT Gateway management in AWS. It automatically creates and deletes NAT Gateways based on a schedule, helping to reduce costs during off-hours while maintaining outbound internet connectivity when needed.

## Changes from Original

- **Multiple Private Subnets**: Support for multiple private subnet IDs (`privateSubnetIds` array instead of single `privateSubnetId`)
- **EIP Reuse**: Elastic IP is retained after NAT Gateway deletion and reused on next creation
- **Name Prefix/Suffix**: Support for `namePrefix` and `nameSuffix` options to avoid resource naming conflicts
- **Updated Runtime**: Uses Node.js 24 Lambda runtime (latest LTS)
- **TypeScript Lambda**: Lambda function rewritten in TypeScript with improved error handling

## Features

- **Scheduled Creation/Deletion**: Automatically create and delete NAT Gateways based on cron schedules
- **EIP Reuse**: Reuses the same Elastic IP address across create/delete cycles to maintain a consistent outbound IP
- **Multi-Project Support**: Supports name prefixes/suffixes to avoid resource naming conflicts when used in multiple projects
- **Route Table Management**: Automatically updates route tables when creating/deleting NAT Gateways

## Installation

```bash
npm install scheduled-natgateway
```

## Usage

### Basic Usage

```typescript
import { ScheduledNatGateway } from 'scheduled-natgateway';

new ScheduledNatGateway(this, 'ScheduledNatGateway', {
  publicSubnetId: 'subnet-12345678',
  privateSubnetIds: ['subnet-87654321', 'subnet-11111111'],
  createSchedule: '0 9 ? * MON-FRI *',  // Create at 9 AM on weekdays
  deleteSchedule: '0 18 ? * MON-FRI *', // Delete at 6 PM on weekdays
});
```

### Multiple Projects (with Name Prefix/Suffix)

When using this construct in multiple projects or environments, use the `namePrefix` or `nameSuffix` options to avoid resource naming conflicts:

```typescript
// Project A
new ScheduledNatGateway(this, 'ScheduledNatGateway', {
  publicSubnetId: 'subnet-12345678',
  privateSubnetIds: ['subnet-87654321'],
  createSchedule: '0 9 ? * MON-FRI *',
  deleteSchedule: '0 18 ? * MON-FRI *',
  namePrefix: 'project-a',  // Resources will be named: project-a-ScheduledNatGatewayFunction, etc.
});

// Project B
new ScheduledNatGateway(this, 'ScheduledNatGateway', {
  publicSubnetId: 'subnet-22222222',
  privateSubnetIds: ['subnet-33333333'],
  createSchedule: '0 8 ? * MON-FRI *',
  deleteSchedule: '0 19 ? * MON-FRI *',
  namePrefix: 'project-b',  // Resources will be named: project-b-ScheduledNatGatewayFunction, etc.
});

// Using suffix
new ScheduledNatGateway(this, 'ScheduledNatGateway', {
  publicSubnetId: 'subnet-44444444',
  privateSubnetIds: ['subnet-55555555'],
  createSchedule: '0 7 ? * * *',
  deleteSchedule: '0 20 ? * * *',
  nameSuffix: 'prod',  // Resources will be named: ScheduledNatGatewayFunction-prod, etc.
});
```

## Props

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `publicSubnetId` | `string` | The ID of the public subnet where the NAT Gateway will be created | Yes |
| `privateSubnetIds` | `string[]` | Array of private subnet IDs whose route tables will be updated | Yes |
| `createSchedule` | `string` | Cron expression for when to create the NAT Gateway | Yes |
| `deleteSchedule` | `string` | Cron expression for when to delete the NAT Gateway | Yes |
| `namePrefix` | `string` | Optional prefix for resource names to avoid conflicts | No |
| `nameSuffix` | `string` | Optional suffix for resource names to avoid conflicts | No |

## Schedule Format

The schedule uses cron expressions in the format: `cron(Minutes Hours Day-of-month Month Day-of-week Year)`

Examples:
- `0 9 ? * MON-FRI *` - 9:00 AM on weekdays
- `0 18 ? * MON-FRI *` - 6:00 PM on weekdays
- `0 7 ? * * *` - 7:00 AM every day
- `0 20 ? * * *` - 8:00 PM every day

## How It Works

1. **Creation**: At the scheduled time, the Lambda function:
   - Checks for an existing EIP with the configured tag name
   - Reuses the EIP if found, or allocates a new one if not
   - Creates a NAT Gateway in the specified public subnet
   - Updates route tables of private subnets to route traffic through the NAT Gateway

2. **Deletion**: At the scheduled time, the Lambda function:
   - Finds the NAT Gateway in the public subnet
   - Deletes the NAT Gateway
   - Removes routes from private subnet route tables
   - Retains the EIP for future use (does not release it)

## Cost Savings

- NAT Gateways cost approximately $0.045 per hour
- By running only during business hours (9 AM - 6 PM on weekdays), you can save ~73% on NAT Gateway costs
- EIP retention ensures consistent outbound IP addresses for whitelisting purposes

## IAM Permissions

The Lambda function is automatically granted the following permissions:
- `ec2:CreateNatGateway`, `ec2:DeleteNatGateway`
- `ec2:DescribeNatGateways`, `ec2:DescribeRouteTables`, `ec2:DescribeAddresses`, `ec2:DescribeVpcs`
- `ec2:CreateRoute`, `ec2:ReplaceRoute`, `ec2:DeleteRoute`, `ec2:AssociateRouteTable`
- `ec2:AllocateAddress` (only for initial EIP allocation)
- `ec2:CreateTags`

## Development

```bash
npm run build   # Compile TypeScript to JavaScript
npm run watch   # Watch for changes and compile
npm run test    # Run unit tests
```

## License

This project is licensed under the MIT License.
