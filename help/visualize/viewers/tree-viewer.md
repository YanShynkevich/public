
# Tree viewer

The tree viewer shows the hierarchical structure of your data. It groups dataset rows into nodes based on their values in one or several columns. Each node can have child nodes forming multiple hierarchy levels. In this case, сhild nodes detail the data of their parent node.

>Note: The tree viewer composition is similar to multiple grouping in a SQL query, with the difference that here each group is a node.

Use the tree viewer to visualize and explore any series array with the categorical data.

Common uses:

* An organizational chart
* Headcount by location

![Tree viewer composition](../viewers/treeViewer.png)

## Create a tree viewer

1. On the menu ribbon, click the **Add viewer** icon. A dialog opens.
2. In the dialog, select **Tree viewer**.
3. Click OK.

GIF – add a tree viewer

### Setting the tree hierarchy

When you add the viewer, Datagrok automatically detects two categorical columns with the least number of categories. They form the initial hierarchy of the tree chart.

>Notes:
>
>The platform automatically groups empty cells to a node with no name.
>
>The root node depicts the whole dataset and forms level 0.

You can change the tree chart's hierarchy by adding/deleting new levels and changing their order.
To set the tree hierarchy, do the following:

1. Right-click the viewer and select **Properties…**. This action updates the **Context Pane** with available properties in **Data** and **Misc** info panels.
1. On the **Data** info panel, locate **Hierarchy** and click the **...** button next to it. The **Select columns…** dialog opens.
1. Optional. To add/delete hierarchy levels, select/deselect corresponding columns using the checkboxes provided.
1. Optional. To change the order of levels, rearrange the column’s order:
   * Select a column by clicking it.
   * Drag it to the proper position.
1. Click OK.

After setting the hierarchy, the viewer automatically expands levels according to the **Initial Tree Depth** property. Its default value is 2. To change the **Initial Tree Depth** value, follow these steps:

1. On the **Misc** info panel, locate the **Initial Tree Depth** property.
2. Set the number of levels that the viewer automatically displays.

You can also expand and collapse the whole tree hierarchy. To do so, switch the **Expand and Collapse** property:

* To expands the entire tree hierarchy, unselect it.
* To collapse the tree to the initial tree depth, select it.

You can expand and collapse individual nodes by clicking them. The viewer displays a collapsed node with a filled circle and an expanded node with an empty one. The leaf nodes are always empty circles.

GIF – setting the hierarchy

## Customizing a tree viewer

You can customize the tree viewer by changing its layout and orientation, adding the nodes' size and color coding, setting the branches' shape, and more.

### Tree layout and orientation

You can set the tree **Layout** as either _orthogonal_ or _radial_. The _orthogonal_ layout usually refers to the horizontal and vertical directions. And the _radial_ layout refers to the view where the root node is the center, and each level is the ring.

You can define the direction of the _orthogonal_ layout by setting the **Orient** property. The corresponding orientations with shorthand values are the following:

* _from left to right_ as _LR_
* _from right to left_ as _RL_
* _from top to bottom_ as _TB_
* _from bottom to top_ as _BT_

By default, **Layout** is _orthogonal_, and **Orient** is _LR_. And you can change these settings on the **Misc** info panel by choosing the corresponding values from the dropdown list.

Also, you can change the position of the tree chart on the viewer. To do that,  on the **Misc** info panel, manipulate the settings of the **Top**, **Left**, **Bottom**, and **Right** margins.

GIF – changing layout

### Changing node color, size, and symbol

When you add a viewer, all nodes are equally sized. You can size-code them to make the tree viewer more informative. For example, you can set a relationship between the node’s size and value. Thus you can visually correlate the values of nodes with each other. Additionally,  you can apply an aggregation function to the node data and set the node size depending on this value.

To add size coding for the tree nodes, do the following:

1. On the **Data** info panel, locate **Size** and click the **Down Arrow** control next to it. A dialog opens.
1. Select a column for the aggregation.
1. Below, find the **Size Aggr Type** property.
1. Select an aggregation function from the dropdown list.

Similarly, you can set the color coding for nodes using **Color Aggr Type** and **Color** properties.

Another way to customize your tree viewer is to change a symbol depicting nodes. To do that, follow these steps:

1. On the **Misc** info panel, locate the **Symbol** property.
1. Select the one from the dropdown list.
1. Optional. Below, adjust the **Symbol size** property.

GIF – size and color coding, changing symbol

### Changing branch shape

For the _orthogonal_ layout, you can set the shape of the tree branches. Its default value is _curve_. And you can change it to _polyline_. To do that, on the **Misc** info panel, locate the **Edge Shape** property and select the value from the dropdown list.

brief GIF – switching the shape

## Tree viewer interaction

All viewers share the same row selection and filtered state, which can be [manipulated](../viewers.md#selection) consistently across all viewers.  Since a tree viewer shows aggregated values, it doesn’t share the row selection. And it displays a node as selected if you select all node elements.

Use the following keys to manipulate the node selection.

|      Selection                            |         Key              |
|-------------------------------------|-----------------------|
| Add node to selection           | Node: shift+click|
| Toggle node selection           |  Node: ctrl+click |

GIF (showing the interaction between tree viewer, scatterplot, filter, and grid)

## Common actions

You can manipulate the tree viewer just like a regular Datagrok viewer:

* Customize it
* Change the [viewer's docking layout](../viewers.md#docking), and
* [Embed](../viewers.md#embedding) it into an external site as an iframe

>Note: To see the complete list of common actions, see [Common actions](../viewers.md#common-actions).

Once you configure the viewer, you can [save its settings in a view **Layout**](../viewers.md#layouts) to apply them later to a different dataset.

## See also

* Network viewer
* [Viewers](../viewers.md)
* [View](../../datagrok/table-view.md)
* [Dashboards](../dashboard.md)
<!-- TBD* BiostructureViewer 
* PhyloTreeViewer-->
