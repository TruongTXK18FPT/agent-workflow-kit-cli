---
name: drawio-diagram
description: Analyze source code to generate precise Draw.io XML templates for 10 architecture and system diagram types
---

Follow this process to generate native, valid Draw.io XML files representing the codebase architecture or requested system design.

Inputs:
- targetDiagramType: One of `system-overview`, `sequence`, `class`, `context`, `use-case`, `erd`, `peter-chen`, `package`, `workflow`, `state`
- scopeDescription: Specific system module, workflow, or architecture logic to visualize
- customFormatting: Optional formatting settings (defaults to monochrome)

Steps:
1. **Analyze System Codebase & Logic:**
   - Scan the relevant directories or design specifications.
   - For sequence, class, package, and entity relationship diagrams, retrieve actual class definitions, dependencies, database entities, and method signatures from the workspace.

2. **Formulate the Graph Structure:**
   - Establish unique, static string/numeric IDs for all nodes (e.g., `id="node-1"`) and parent groupings.
   - Compute clear, non-overlapping grid layout coordinates (`x`, `y`, `width`, `height`) for all shapes.
   - Restrict colors strictly to monochrome style:
     - `fillColor=#ffffff` (White fill)
     - `strokeColor=#000000` (Black border/line)
     - `fontColor=#000000` (Black text)

3. **Verify Node & Arrow Syntax for Selected Diagram Type:**
   Apply the specific Draw.io style mappings defined in the rules below.

4. **Output Code Block:**
   Wrap the complete, uncompressed Draw.io XML inside a code block (`xml`) so the user can copy and paste it into Draw.io's XML/SVG editor, or save as a `.drawio` file.

---

## 🏛️ Draw.io XML Syntax Rules by Diagram Type

### 1. System Overview Diagram
* **Containers (Subsystems/Layers):** Represent layers using group swimlanes or dashed rectangles:
  `style="swimlane;html=1;childLayout=stackLayout;horizontal=1;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;whiteSpace=wrap;"`
* **Components:** In-container elements:
  `style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Connections:** Directed communication links with protocol labels:
  `style="endArrow=classic;html=1;strokeColor=#000000;fontColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-overview" name="System Overview">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="layer-ui" value="Presentation Layer (Frontend)" style="swimlane;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="650" height="150" as="geometry" />
        </mxCell>
        <mxCell id="node-spa" value="Single Page Application&#xa;(React / TypeScript)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="layer-ui">
          <mxGeometry x="240" y="50" width="170" height="60" as="geometry" />
        </mxCell>
        <mxCell id="layer-api" value="Application Layer (Backend)" style="swimlane;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="100" y="300" width="650" height="150" as="geometry" />
        </mxCell>
        <mxCell id="node-api-gw" value="REST API Gateway" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="layer-api">
          <mxGeometry x="240" y="50" width="170" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge-http" value="HTTPS / JSON" style="endArrow=classic;html=1;strokeColor=#000000;fontColor=#000000;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="node-spa" target="node-api-gw">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 2. Sequence Diagram
* **Lifelines:** Vertical dashed lines extending from participants:
  `style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;dashed=1;"`
* **Activation Bars:** Small vertical overlays mapping message durations:
  `style="html=1;points=[];fillColor=#ffffff;strokeColor=#000000;"`
* **Participant Naming:** Standard colon representation: `instance:Class` or `:Class` (e.g. `orderController:OrderController`).
* **Communication Edges:**
  - Synchronous Message: `style="endArrow=block;html=1;strokeColor=#000000;fontColor=#000000;"`
  - Return/Response Message: `style="endArrow=open;dashed=1;html=1;strokeColor=#000000;fontColor=#000000;"`
  - Asynchronous Message: `style="endArrow=open;html=1;strokeColor=#000000;fontColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-seq" name="Sequence Flow">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="life-client" value="client:Client" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="100" height="300" as="geometry" />
        </mxCell>
        <mxCell id="act-client" value="" style="html=1;points=[];fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="life-client">
          <mxGeometry x="45" y="70" width="10" height="150" as="geometry" />
        </mxCell>
        <mxCell id="life-controller" value="orderController:OrderController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="320" y="80" width="180" height="300" as="geometry" />
        </mxCell>
        <mxCell id="act-controller" value="" style="html=1;points=[];fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="life-controller">
          <mxGeometry x="85" y="80" width="10" height="100" as="geometry" />
        </mxCell>
        <mxCell id="msg-create" value="createOrder(details)" style="endArrow=block;html=1;strokeColor=#000000;fontColor=#000000;entryX=0;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="act-client" target="act-controller">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="160" y="160" as="sourcePoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="msg-resp" value="OrderCreatedResponse" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;fontColor=#000000;exitX=0;exitY=1;exitDx=0;exitDy=0;entryX=1;entryY=0.66;" edge="1" parent="1" source="act-controller" target="act-client">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="240" y="260" as="sourcePoint" />
          </mxGeometry>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 3. Class Diagram
* **Compartmentalized Class Box:** Partition fields and operations:
  `style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Access Modifiers:** Prefix members with `+` (public), `-` (private), `#` (protected), `~` (package).
* **Relationship Arrows:**
  - Inheritance (Generalization): Solid line, open triangle: `style="endArrow=block;endFill=0;html=1;strokeColor=#000000;"`
  - Implementation (Realization): Dashed line, open triangle: `style="endArrow=block;endFill=0;dashed=1;html=1;strokeColor=#000000;"`
  - Association: Solid line, open arrowhead: `style="endArrow=open;endSize=12;html=1;strokeColor=#000000;"`
  - Dependency: Dashed line, open arrowhead: `style="endArrow=open;dashed=1;html=1;strokeColor=#000000;"`
  - Composition: Solid line, filled diamond: `style="endArrow=diamond;endFill=1;endSize=14;html=1;strokeColor=#000000;"`
  - Aggregation: Solid line, empty diamond: `style="endArrow=diamond;endFill=0;endSize=14;html=1;strokeColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-class" name="Class Diagram">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="class-payment" value="PaymentService" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="180" height="114" as="geometry" />
        </mxCell>
        <mxCell id="fields-payment" value="- client: HttpClient&#xa;- apiKey: String" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[];portConstraint=eastwest;" vertex="1" parent="class-payment">
          <mxGeometry y="26" width="180" height="38" as="geometry" />
        </mxCell>
        <mxCell id="divider" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="class-payment">
          <mxGeometry y="64" width="180" height="10" as="geometry" />
        </mxCell>
        <mxCell id="methods-payment" value="+ process(Order): boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[];portConstraint=eastwest;" vertex="1" parent="class-payment">
          <mxGeometry y="74" width="180" height="40" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 4. Context Diagram
* **Central System Boundary:** Draw a rounded rect or large central ellipse:
  `style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;strokeWidth=2;"`
* **External Entities:** Peripheral rectangles:
  `style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Communication Rules:** Tectonic flows cannot connect external entities directly; they must connect entities to the central system only.
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-context" name="System Context">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="node-system" value="E-Commerce System&#xa;(Central Boundary)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="320" y="200" width="180" height="120" as="geometry" />
        </mxCell>
        <mxCell id="node-user" value="Customer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="230" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge-order" value="Submits Order" style="endArrow=classic;html=1;strokeColor=#000000;fontColor=#000000;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="node-user" target="node-system">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 5. Use Case Diagram
* **Actors:** Standard stick figures:
  `style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **System Boundary:** High-contrast rectangle grouping all use cases:
  `style="shape=rectangle;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;fontColor=#000000;verticalAlign=top;align=left;spacingLeft=10;spacingTop=10;"`
* **Use Cases:** Horizontal ovals inside the boundary:
  `style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Relations:**
  - Simple Association: Plain line: `style="endArrow=none;html=1;strokeColor=#000000;"`
  - `<<include>>` / `<<extend>>`: Dashed line with open arrow pointing to the referenced use case: `style="endArrow=open;dashed=1;html=1;strokeColor=#000000;fontColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-usecase" name="Use Case Diagram">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="system-boundary" value="Order Processing System" style="shape=rectangle;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;fontColor=#000000;verticalAlign=top;align=left;spacingLeft=10;spacingTop=10;" vertex="1" parent="1">
          <mxGeometry x="250" y="80" width="350" height="300" as="geometry" />
        </mxCell>
        <mxCell id="usecase-checkout" value="Checkout Order" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="system-boundary">
          <mxGeometry x="80" y="60" width="180" height="60" as="geometry" />
        </mxCell>
        <mxCell id="usecase-discount" value="Apply Coupon" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="system-boundary">
          <mxGeometry x="80" y="180" width="180" height="60" as="geometry" />
        </mxCell>
        <mxCell id="actor-user" value="Customer" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="160" width="40" height="80" as="geometry" />
        </mxCell>
        <mxCell id="edge-assoc" value="" style="endArrow=none;html=1;strokeColor=#000000;exitX=0.5;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=1;entryX=0;entryY=0.5;" edge="1" parent="1" source="actor-user" target="usecase-checkout">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge-extend" value="&lt;&lt;extend&gt;&gt;" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;fontColor=#000000;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" edge="1" parent="1" source="usecase-discount" target="usecase-checkout">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 6. Entity Relationship Diagram (ERD)
* **ERD Tables:** Entity tables showing columns:
  `style="shape=mxgraph.er.table;html=1;childLayout=tableLayout;horizontal=1;startSize=26;resizeParent=1;resizeParentMax=0;resizeLast=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Rows & Key Markers:** Use a tabular layout to display fields, marking `PK` / `FK` in the left cells.
* **Crow's Foot Edges:**
  - One-to-many relationship: `style="endArrow=ERoneToMany;startArrow=ERmandOne;strokeColor=#000000;"` or `ERmanyToOne`.
  - Zero-to-many relationship: `style="endArrow=ERzeroToMany;startArrow=ERmandOne;strokeColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-erd" name="Entity Relationship">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="tbl-customer" value="customer" style="shape=mxgraph.er.table;html=1;childLayout=tableLayout;horizontal=1;startSize=26;resizeParent=1;resizeParentMax=0;resizeLast=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="180" height="98" as="geometry" />
        </mxCell>
        <mxCell id="row-cus-pk" style="shape=mxgraph.er.row;html=1;portConstraint=eastwest;" vertex="1" parent="tbl-customer">
          <mxGeometry y="26" width="180" height="24" as="geometry" />
        </mxCell>
        <mxCell id="cell-pk" value="PK" style="shape=mxgraph.er.cell;html=1;align=center;" vertex="1" parent="row-cus-pk">
          <mxGeometry width="30" height="24" as="geometry" />
        </mxCell>
        <mxCell id="cell-id" value="id : integer" style="shape=mxgraph.er.cell;html=1;align=left;" vertex="1" parent="row-cus-pk">
          <mxGeometry x="30" width="150" height="24" as="geometry" />
        </mxCell>
        <mxCell id="row-cus-name" style="shape=mxgraph.er.row;html=1;portConstraint=eastwest;" vertex="1" parent="tbl-customer">
          <mxGeometry y="50" width="180" height="24" as="geometry" />
        </mxCell>
        <mxCell id="cell-name-lbl" value="" style="shape=mxgraph.er.cell;html=1;align=center;" vertex="1" parent="row-cus-name">
          <mxGeometry width="30" height="24" as="geometry" />
        </mxCell>
        <mxCell id="cell-name" value="name : varchar(100)" style="shape=mxgraph.er.cell;html=1;align=left;" vertex="1" parent="row-cus-name">
          <mxGeometry x="30" width="150" height="24" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 7. Conceptual Diagram (Peter Chen Notation)
* **Entities:** Regular rectangles:
  `style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Attributes:** Ellipses:
  `style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"` (Primary key titles must have underlined text).
* **Relationships:** Central diamonds:
  `style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Cardinality Labels:** Simple lines with numeric/alphanumeric labels (e.g. `1`, `N`, `M` labels near the connectors).
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-peterchen" name="Peter Chen Conceptual">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="ent-customer" value="Customer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="200" width="120" height="50" as="geometry" />
        </mxCell>
        <mxCell id="rel-buys" value="Buys" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="360" y="185" width="100" height="80" as="geometry" />
        </mxCell>
        <mxCell id="ent-product" value="Product" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="600" y="200" width="120" height="50" as="geometry" />
        </mxCell>
        <mxCell id="attr-id" value="&lt;u&gt;CustomerID&lt;/u&gt;" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="110" y="80" width="100" height="50" as="geometry" />
        </mxCell>
        <mxCell id="edge-ent1" value="1" style="endArrow=none;html=1;strokeColor=#000000;fontColor=#000000;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="ent-customer" target="rel-buys">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge-ent2" value="N" style="endArrow=none;html=1;strokeColor=#000000;fontColor=#000000;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="rel-buys" target="ent-product">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge-attr" value="" style="endArrow=none;html=1;strokeColor=#000000;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="attr-id" target="ent-customer">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 8. Package Diagram
* **Folder Shapes:** Package components:
  `style="shape=folder;fontStyle=1;spacingLeft=10;tabWidth=40;tabHeight=14;tabPosition=left;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;whiteSpace=wrap;"`
* **Package Relations:** Dashed line dependency connectors:
  `style="endArrow=open;dashed=1;html=1;strokeColor=#000000;fontColor=#000000;"` (labeled `<<import>>` or `<<access>>`).
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-package" name="Package Dependencies">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="pkg-controller" value="controllers" style="shape=folder;fontStyle=1;spacingLeft=10;tabWidth=40;tabHeight=14;tabPosition=left;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="150" height="80" as="geometry" />
        </mxCell>
        <mxCell id="pkg-service" value="services" style="shape=folder;fontStyle=1;spacingLeft=10;tabWidth=40;tabHeight=14;tabPosition=left;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="100" y="260" width="150" height="80" as="geometry" />
        </mxCell>
        <mxCell id="edge-dep" value="&lt;&lt;import&gt;&gt;" style="endArrow=open;dashed=1;html=1;strokeColor=#000000;fontColor=#000000;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="pkg-controller" target="pkg-service">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 9. Workflow Diagram
* **Swimlanes (Executor Partitioning):** Organise flows via pools/lanes:
  `style="swimlane;html=1;horizontal=0;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
  Ensure there are at least two distinct swimlanes to clearly separate the User (Actor/Role) and the System.
* **Nodes:**
  - Start Node: Solid black circle: `style="ellipse;fillColor=#000000;strokeColor=#000000;html=1;"`
  - End Node: Double circle: `style="doubleEllipse;fillColor=#000000;strokeColor=#000000;html=1;"`
  - Activities: Rounded rectangles: `style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
  - Decisions: Diamond: `style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-workflow" name="Process Workflow">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="swim-user" value="User Role" style="swimlane;html=1;horizontal=0;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="80" width="680" height="150" as="geometry" />
        </mxCell>
        <mxCell id="flow-start" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;html=1;" vertex="1" parent="swim-user">
          <mxGeometry x="60" y="60" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="act-input" value="Fill Form" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="swim-user">
          <mxGeometry x="160" y="45" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="swim-system" value="System" style="swimlane;html=1;horizontal=0;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="230" width="680" height="150" as="geometry" />
        </mxCell>
        <mxCell id="act-validate" value="Validate Input" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="swim-system">
          <mxGeometry x="160" y="45" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge-start" value="" style="endArrow=classic;html=1;strokeColor=#000000;" edge="1" parent="1" source="flow-start" target="act-input">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge-submit" value="Submit Form" style="endArrow=classic;html=1;strokeColor=#000000;fontColor=#000000;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="act-input" target="act-validate">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

### 10. State Diagram
* **States:** Rounded rectangles representing operational states:
  `style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"`
* **Transitional Events:** Direct paths labeled with `Trigger [Guard] / Action` context:
  `style="endArrow=classic;html=1;strokeColor=#000000;fontColor=#000000;"`
* **XML Template:**
```xml
<mxfile host="Electron" version="21.0.0">
  <diagram id="diag-state" name="State Transition">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="state-draft" value="DRAFT" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="200" width="120" height="50" as="geometry" />
        </mxCell>
        <mxCell id="state-pending" value="PENDING_APPROVAL" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="380" y="200" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="edge-trans" value="submit [allFieldsFilled]" style="endArrow=classic;html=1;strokeColor=#000000;fontColor=#000000;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="state-draft" target="state-pending">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```
