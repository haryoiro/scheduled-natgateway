# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ScheduledNatGateway <a name="ScheduledNatGateway" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway"></a>

#### Initializers <a name="Initializers" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer"></a>

```typescript
import { ScheduledNatGateway } from '@haryoiro/scheduled-natgateway'

new ScheduledNatGateway(scope: Construct, id: string, props: ScheduledNatGatewayProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer.parameter.props">props</a></code> | <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps">ScheduledNatGatewayProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.Initializer.parameter.props"></a>

- *Type:* <a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps">ScheduledNatGatewayProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGateway.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGateway.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.isConstruct"></a>

```typescript
import { ScheduledNatGateway } from '@haryoiro/scheduled-natgateway'

ScheduledNatGateway.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGateway.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="@haryoiro/scheduled-natgateway.ScheduledNatGateway.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### ScheduledNatGatewayProps <a name="ScheduledNatGatewayProps" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps"></a>

#### Initializer <a name="Initializer" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.Initializer"></a>

```typescript
import { ScheduledNatGatewayProps } from '@haryoiro/scheduled-natgateway'

const scheduledNatGatewayProps: ScheduledNatGatewayProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.createSchedule">createSchedule</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.deleteSchedule">deleteSchedule</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.privateSubnetIds">privateSubnetIds</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.publicSubnetId">publicSubnetId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.namePrefix">namePrefix</a></code> | <code>string</code> | Optional prefix for resource names to avoid conflicts. |
| <code><a href="#@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.nameSuffix">nameSuffix</a></code> | <code>string</code> | Optional suffix for resource names to avoid conflicts. |

---

##### `createSchedule`<sup>Required</sup> <a name="createSchedule" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.createSchedule"></a>

```typescript
public readonly createSchedule: string;
```

- *Type:* string

---

##### `deleteSchedule`<sup>Required</sup> <a name="deleteSchedule" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.deleteSchedule"></a>

```typescript
public readonly deleteSchedule: string;
```

- *Type:* string

---

##### `privateSubnetIds`<sup>Required</sup> <a name="privateSubnetIds" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.privateSubnetIds"></a>

```typescript
public readonly privateSubnetIds: string[];
```

- *Type:* string[]

---

##### `publicSubnetId`<sup>Required</sup> <a name="publicSubnetId" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.publicSubnetId"></a>

```typescript
public readonly publicSubnetId: string;
```

- *Type:* string

---

##### `namePrefix`<sup>Optional</sup> <a name="namePrefix" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.namePrefix"></a>

```typescript
public readonly namePrefix: string;
```

- *Type:* string
- *Default:* No prefix

Optional prefix for resource names to avoid conflicts.

---

##### `nameSuffix`<sup>Optional</sup> <a name="nameSuffix" id="@haryoiro/scheduled-natgateway.ScheduledNatGatewayProps.property.nameSuffix"></a>

```typescript
public readonly nameSuffix: string;
```

- *Type:* string
- *Default:* No suffix

Optional suffix for resource names to avoid conflicts.

---



