import {
  EC2Client,
  CreateNatGatewayCommand,
  DeleteNatGatewayCommand,
  AllocateAddressCommand,
  DescribeNatGatewaysCommand,
  DescribeAddressesCommand,
  DescribeRouteTablesCommand,
  CreateRouteCommand,
  DeleteRouteCommand,
  ReplaceRouteCommand,
  waitUntilNatGatewayAvailable,
  waitUntilNatGatewayDeleted,
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({});

interface LambdaEvent {
  operation: "create" | "delete";
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  const publicSubnetId = process.env.PUBLIC_SUBNET_ID;
  const privateSubnetIds = process.env.PRIVATE_SUBNET_IDS?.split(',').filter(id => id.trim());
  const eipTagName = process.env.EIP_TAG_NAME || "scheduled-nat-eip";
  const natGatewayTagName = process.env.NAT_GATEWAY_TAG_NAME || "scheduled-nat-gateway";

  if (!publicSubnetId || !privateSubnetIds || privateSubnetIds.length === 0) {
    throw new Error("PUBLIC_SUBNET_ID and PRIVATE_SUBNET_IDS environment variables are required");
  }

  const isCreate = event.operation === "create";

  try {
    const operation = isCreate ? createNatGateway : deleteNatGateway;
    const natGatewayId = await operation(publicSubnetId, eipTagName, natGatewayTagName);

    await updateRouteTables(natGatewayId, privateSubnetIds, isCreate);

    return {
      statusCode: 200,
      body: JSON.stringify(
        `Successfully ${
          isCreate ? "created" : "deleted"
        } NAT Gateway ${natGatewayId}`
      ),
    };
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to ${isCreate ? "create" : "delete"} NAT Gateway: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

async function createNatGateway(publicSubnetId: string, eipTagName: string, natGatewayTagName: string): Promise<string> {
  // First, check if an EIP with our tag already exists
  const describeAddressesCommand = new DescribeAddressesCommand({
    Filters: [
      {
        Name: "tag:Name",
        Values: [eipTagName],
      },
      {
        Name: "domain",
        Values: ["vpc"],
      },
    ],
  });

  const describeAddressesResponse = await ec2Client.send(describeAddressesCommand);
  const addresses = describeAddressesResponse.Addresses || [];

  let allocationId: string | undefined;

  const unassociatedEips = addresses.filter(addr => !addr.AssociationId);

  if (unassociatedEips.length > 0) {
    if (unassociatedEips.length > 1) {
      console.warn(`Found ${unassociatedEips.length} unassociated EIPs with tag '${eipTagName}'. Using the first one.`);
      console.warn("Consider cleaning up extra EIPs to avoid confusion.");
    }

    const eipToUse = unassociatedEips[0];
    if (eipToUse.AllocationId) {
      console.log(`Reusing existing EIP: ${eipToUse.PublicIp} (AllocationId: ${eipToUse.AllocationId})`);
      allocationId = eipToUse.AllocationId;
    }
  } else if (addresses.length > 0) {
    console.log(`Found ${addresses.length} EIP(s) with tag '${eipTagName}', but all are associated.`);
    console.log("Allocating a new EIP.");
  }

  if (!allocationId) {
    console.log("No existing EIP found, allocating a new one");
    const allocateAddressCommand = new AllocateAddressCommand({
      Domain: "vpc",
      TagSpecifications: [
        {
          ResourceType: "elastic-ip",
          Tags: [
            {
              Key: "Name",
              Value: eipTagName,
            },
          ],
        },
      ],
    });

    const allocateAddressResponse = await ec2Client.send(allocateAddressCommand);
    allocationId = allocateAddressResponse.AllocationId;
    console.log(`Allocated new EIP: ${allocateAddressResponse.PublicIp} (AllocationId: ${allocationId})`);
  }

  if (!allocationId) {
    throw new Error("Failed to get Elastic IP");
  }

  // Create NAT Gateway
  const createNatGatewayCommand = new CreateNatGatewayCommand({
    AllocationId: allocationId,
    SubnetId: publicSubnetId,
    TagSpecifications: [
      {
        ResourceType: "natgateway",
        Tags: [
          {
            Key: "Name",
            Value: natGatewayTagName,
          },
        ],
      },
    ],
  });

  const createNatGatewayResponse = await ec2Client.send(createNatGatewayCommand);
  const natGatewayId = createNatGatewayResponse.NatGateway?.NatGatewayId;

  if (!natGatewayId) {
    throw new Error("Failed to create NAT Gateway");
  }

  // Wait for the NAT Gateway to become available
  await waitUntilNatGatewayAvailable(
    {
      client: ec2Client,
      maxWaitTime: 600,
    },
    { NatGatewayIds: [natGatewayId] }
  );

  return natGatewayId;
}

async function deleteNatGateway(publicSubnetId: string, eipTagName: string, natGatewayTagName: string): Promise<string> {
  // Find the ID of the NAT Gateway in the subnet
  const describeNatGatewaysCommand = new DescribeNatGatewaysCommand({
    Filter: [
      { Name: "subnet-id", Values: [publicSubnetId] },
      { Name: "state", Values: ["available"] },
    ],
  });

  const describeNatGatewaysResponse = await ec2Client.send(describeNatGatewaysCommand);
  const natGateways = describeNatGatewaysResponse.NatGateways || [];

  if (natGateways.length === 0) {
    throw new Error(`No NAT Gateway found in subnet ${publicSubnetId}`);
  }

  const natGatewayId = natGateways[0].NatGatewayId;
  if (!natGatewayId) {
    throw new Error("NAT Gateway ID not found");
  }

  // Get EIP information for logging (but don't release it)
  const eipInfo = natGateways[0].NatGatewayAddresses?.[0];
  if (eipInfo) {
    console.log(`NAT Gateway ${natGatewayId} is using EIP: ${eipInfo.PublicIp} (AllocationId: ${eipInfo.AllocationId})`);
    console.log("EIP will be retained for future use");
  }

  // Delete the NAT Gateway
  const deleteNatGatewayCommand = new DeleteNatGatewayCommand({
    NatGatewayId: natGatewayId,
  });

  await ec2Client.send(deleteNatGatewayCommand);

  // Wait for the NAT Gateway to be deleted
  await waitUntilNatGatewayDeleted(
    {
      client: ec2Client,
      maxWaitTime: 600,
    },
    { NatGatewayIds: [natGatewayId] }
  );

  console.log(`NAT Gateway ${natGatewayId} deleted successfully. EIP has been retained.`);

  return natGatewayId;
}

async function updateRouteTables(
  natGatewayId: string,
  privateSubnetIds: string[],
  isCreate: boolean
): Promise<void> {
  for (const privateSubnetId of privateSubnetIds) {
    const describeRouteTablesCommand = new DescribeRouteTablesCommand({
      Filters: [{ Name: "association.subnet-id", Values: [privateSubnetId] }],
    });

    const describeRouteTablesResponse = await ec2Client.send(describeRouteTablesCommand);
    const routeTables = describeRouteTablesResponse.RouteTables || [];

    for (const routeTable of routeTables) {
    const routeTableId = routeTable.RouteTableId;
    if (!routeTableId) continue;

    const existingRoute = routeTable.Routes?.find(
      (route) => route.DestinationCidrBlock === "0.0.0.0/0"
    );

    if (isCreate) {
      if (existingRoute) {
        if (existingRoute.NatGatewayId === natGatewayId) {
          console.log(
            `Route for 0.0.0.0/0 in route table ${routeTableId} already points to NAT Gateway ${natGatewayId}`
          );
          continue;
        }

        console.log(
          `Replacing route for 0.0.0.0/0 in route table ${routeTableId} from NAT Gateway ${existingRoute.NatGatewayId} to NAT Gateway ${natGatewayId}`
        );

        const replaceRouteCommand = new ReplaceRouteCommand({
          DestinationCidrBlock: existingRoute.DestinationCidrBlock,
          NatGatewayId: natGatewayId,
          RouteTableId: routeTableId,
        });

        await ec2Client.send(replaceRouteCommand);
      } else {
        console.log(
          `Creating new route for 0.0.0.0/0 in route table ${routeTableId} to NAT Gateway ${natGatewayId}`
        );

        const createRouteCommand = new CreateRouteCommand({
          DestinationCidrBlock: "0.0.0.0/0",
          NatGatewayId: natGatewayId,
          RouteTableId: routeTableId,
        });

        await ec2Client.send(createRouteCommand);
      }
    } else {
      if (existingRoute && existingRoute.NatGatewayId === natGatewayId) {
        console.log(
          `Delete Route for 0.0.0.0/0 in route table ${routeTableId} points to NAT Gateway ${natGatewayId}`
        );

        const deleteRouteCommand = new DeleteRouteCommand({
          RouteTableId: routeTableId,
          DestinationCidrBlock: "0.0.0.0/0",
        });

        await ec2Client.send(deleteRouteCommand);
      }
    }
    }
  }
}
