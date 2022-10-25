
# Tree viewer

A tree viewer visualizes the hierarchical structure of categorical data, where levels correspond to the columns and nodes group rows with the same categories. Thus nodes of the first level use data from the entire dataset. And nodes of subsequent levels receive data from their parent nodes.

> Note: Empty cells, if they are, form a separate category with no name.
<!--Note: BiostructureViewer, PhyloTreeViewer for phylogenetic trees visualization-->

The platform automatically detects categorical columns with the least number of categories to build a tree chart. By default, it has three levels. You can adjust the number of initially expanded levels and change the tree chart's hierarchy by editing the **Initial Tree Depth** and **Hierarchy** properties. Additionally, you can use size coding to highlight nodes with larger values of the selected aggregation function applied to the specified column (see the **Size Aggr Type** and **Size** properties). Similarly, you can color-code the nodes using  **Color Aggr Type** and **Color** properties.

For the complete list of tree viewer properties, see [Properties](tree-viewer.md#properties)

>Developers: To learn more about tree chart properties, see [ECharts](https://echarts.apache.org/en/option.html#series-tree) library documentation.

To add a tree viewer, on the menu ribbon, click the **Add viewer** icon and select **Tree viewer** in the opened window. To see the properties, right-click the viewer and select **Properties…**. This action updates the **Context Pane** with available properties in **Data** and **Misc** info panels.

GIF (changing the properties)

Like other Datagrok viewers, a tree viewer is highly interactive, sharing the same filtered state with other objects on the view. For more information on manipulation across all viewers, see [Selection](../viewers.md#selection). As well, you can change the viewer's docking layout (see [Docking](../viewers.md#docking)), customize it, and embed it into an external site as an iframe (see [Embedding](../viewers.md#embedding)). Once you configure the relative position of the viewer and its properties, you can save these settings in view **Layout** to apply them later to a different dataset. To learn more about view layout, see [Layouts](../viewers.md#layouts).

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
