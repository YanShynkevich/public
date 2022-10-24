# Tree viewer

A tree viewer visualizes the hierarchical structure of a dataset's categorical data. Nodes on the first level depict the categories of a corresponding column and show the number of rows with these categories. Each node can branch, forming the next level corresponding to another categorical column. A branch between nodes appears if the categories of parent and child nodes are on the same row. The child node shows the list of all its parents and the number of rows containing all corresponding categories.

The platform automatically detects the categorical columns with the least number of categories and builds a tree viewer. By default, the tree viewer has three levels: the root node on level 0 to the leaf nodes on level 2. You can adjust the number of initially expanded levels and change the tree viewer's hierarchy by editing the **Initial Tree Depth** and **Hierarchy** properties.

> Note: Empty cells, if they are, form a separate category with no name.
<!--Note: BiostructureViewer, PhyloTreeViewer for phylogenetic trees visualization-->

To add a tree viewer,  on the menu ribbon, click the **Add viewer** icon and select **Tree viewer** in the opened window. To see the properties, right-click the viewer and select **Properties…**. This action updates the **Context Pane** with available properties in **Data** and **Misc** info panels.

GIF (changing the properties)

Additionally, you can use size coding to highlight nodes with large values of the selected aggregation function applied to the specified column (see the **Size Aggr Type** and **Size** properties). Similarly, you can color-code the nodes using  **Color Aggr Type** and **Color** properties.

For the complete list of tree viewer properties, see [Properties](tree-viewer.md#properties)

>Developers: To learn more about tree diagram properties, see [ECharts](https://echarts.apache.org/en/option.html#series-tree) library documentation.

GIF

You can work with a tree viewer like other Datagrok viewers. It interacts with the grid, filter, and other viewers in the usual manner when all objects share the same filtered state. For more information on manipulation across all viewers, see [Selection](../viewers.md#selection). You can change the viewer's docking layout (see [Docking](../viewers.md#docking)), customize it, and embed it into an external site as an iframe (see [Embedding](../viewers.md#Embedding)) just like other Datagrok viewers. Once you configure the relative position of the viewer and its properties, you can save these settings in view **Layout** to apply them later to a different dataset. To learn more about view layout, see [Layouts](../viewers.md#layouts).

>Note: Since a tree viewer shows aggregated values, not single ones, it highlights the node as selected if you select all of its elements in another object.

GIF (showing the interaction between tree viewer, scatterplot, filter, and grid, docking, saving view layout)

## Actions

|                     |                        |
|---------------------|------------------------|
| Right click         | Context menu           |
| Node: click         | Expand/collapse branch |
| Node: ctrl+click    | Invert node selection  |
| Node: shift+click   | Add node to selection  |

For the complete list of common actions, see [Common Actions](../viewers.md#common-actions)

## Properties

|       Data             |                        |
|------------------------|------------------------|
|   Table                |   Dataset table|
|   Size                 |  Column for the size coding  |
|   Size Aggr Type       |  Aggregation function for the size coding   |
|    Color               | Column for the color coding  |
|    Color Aggr Type     |  Aggregation function for the color coding   |
|  Hierarchy             |   An ordered list of columns defining the hierarchy  |

|       Misc             |                        |
|------------------------|------------------------|
|     Top                | Margin top, px   |
|   Left                 |  Margin left, px   |
|   Bottom               | Margin bottom, px    |
|    Right               |   Margin right, px |
|   Animation Duration   |  Animation duration, ms  |
|   Animation Duration Update | Animation duration update, ms   |
|     Animation          | Whether to enable animation|
|   Layout               | Layout of the tree |
|  Orient                | Direction of the orthogonal layout  |
|   Expand and Collapse  | Whether to expand or collapse nodes   |
|   Initial Tree Depth   |  The number of levels the viewer initially expands. The default depth is 2 (the root node is on level 0 ) |
|   Edge Shape           | Shape of the edge  |
|   Symbol               | Node symbol   |
|   Symbol size          |  Size of node symbol   |

## See also

* [Table view](../../datagrok/table-view.md)
* [Viewers](../viewers.md)
<!--* View
* [Dashboards](../dashboard.md)
* [Context Pane](../../datagrok/navigation.md#properties)
*  [Project](../../datagrok/project.md)-->
