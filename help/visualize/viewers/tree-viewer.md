# Tree viewer

The tree viewer shows the hierarchical structure of your data. It groups dataset rows into nodes based on their values in one or several columns. Use the tree viewer to explore datasets with categorical data.

Common uses:

* An organizational chart
* Sales by location

## Create a tree viewer

1. On the menu ribbon, click the **Add viewer** icon. A dialog opens.
1. In the dialog, select **Tree viewer** and click OK.

When you add the viewer, Datagrok automatically detects two categorical columns with the least number of categories. They form the initial hierarchy of the tree chart.  

## Manage a tree viewer

You can set the tree hierarchy and customize the viewer. To do that, click the **gear** icon on top of the viewer. The **Data** and **Misc** info panels appear on the **Context Pane**. Manage the tree viewer using properties from these panels.

### Set the tree hierarchy

* _Change the tree chart's hierarchy_ by adding/deleting new levels and changing their order. These actions are available from the **Hierarchy** property.
* _Size-code_ the nodes. Apply an aggregation function to the node data, making the node size dependent on this value. To do so, define a column for aggregation in **Size** and select an aggregation function in **Size Aggr Type**.
* Similarly, set the _color coding_ for nodes using **Color Aggr Type** and **Color** properties.

### Expand and collapse the tree

* Expand and collapse the whole tree hierarchy by switching **Expand and Collapse**.
* The viewer automatically collapses the tree according to the **Initial Tree Depth** value. By default, it’s `2` and you can change it.

> Note: Expand and collapse individual nodes by clicking them.

### Customize the tree viewer

* Set the tree **Layout** as either `orthogonal` or `radial`. By default, it’s  `orthogonal`. And for this layout, you can also:
  * Define the tree direction by setting the **Orient** property.
  * Set the shape of the branches in the **Edge Shape** property.

## Viewer controls

|      Action                           |         Control             |
|-------------------------------------|-----------------------|
| Expand/collapse branch        |Node: click   |
| Add node to selection           | Node: shift+click|
| Toggle node selection           |  Node: ctrl+click |

GIF

## See also

* [Viewers](../viewers.md)
* Network viewer
* BiostructureViewer
* PhyloTreeViewer
