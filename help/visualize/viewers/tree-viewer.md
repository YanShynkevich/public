# Tree viewer

A tree viewer visualizes the hierarchical structure of a dataset's categorical data. Each node within the same hierarchy level corresponds to a category within one column and shows the number of rows containing this category. The branches between nodes of different levels form a tree network providing hierarchical data insights.

Initially, the viewer builds a tree structure with up to three levels selecting columns with the least number of categories. Empty cells, if they are, form a separate category with no name.

You can set up a tree viewer from the UI: add size-coding for the nodes, change the order of columns, add new hierarchy levels and more (see [Properties](tree-viewer.md#properties)).

## Creating

Once a table is open, on the menu ribbon, click the **Add viewer** icon and select **Tree viewer** in the opened window.

## Docking

To customize your [table view](../datagrok/table-view.md), you can change the viewer’s docking layout. To learn more about rearranging the view, see [Creating](../viewers.md#creating) and [Docking](../viewers.md#docking).

GIF (showing how to create a tree viewer and dock it)

## Properties

To see the properties available form the UI, right-click the viewer and select **Properties…**. This action updates the **Context Pane** with available properties in **Data** and **Misc** info panels.

>Note: A Context Pane is a key discovery view in Datagrok.
>
>Developers:
>
>Context Pane can be extended. You can add custom [info panels](../../develop/how-to/add-info-panel.md) and [context actions](../../develop/how-to/context-actions.md).
>
>To learn more about tree diagram properties, see [ECharts](https://echarts.apache.org/en/option.html#series-tree) library documentation.

|Data          |                        |
|---------------------|------------------------|
|   Table        |   |
|   Size  |    |
|   Size Aggr Type |    |
|    Color       |   |
|    Color Aggr Type |    |
|  Hierarchy  |    |

|       Misc         |                        |
|---------------------|------------------------|
|     Top      |   |
|   Left  |    |
|   Bottom |    |
|    Right       |   |
|   Animation Duration  |    |
|   Animation Duration Update |    |
|     Animation       |   |
|   Layout  |    |
|  Orient  |    |
|   Expand and Collapse   |   |
|   Initial Tree Depth  |    |

GIF (changing the properties)

See also:

* View
* [Context Pane](https://github.com/datagrok-ai/public/blob/master/help/datagrok/navigation.md#properties).

## Layout

Once you configure the relative position of the viewer and its properties, you can save these settings in view **Layout** to apply them later to a different dataset. To learn more about view layout, see [Layouts](../viewers.md#layouts).

## Actions

|                     |                        |
|---------------------|------------------------|
| Node: click         | Expand/collapse branch |
| Node: ctrl+click    | Invert node selection  |
| Node: shift+click   | Add node to selection  |

## Tooltips
<!--(check!!)-->

## Interaction
<!--(check!!)-->

A tree viewer interacts with the grid, filter, and other viewers in the usual way when all objects share the same filtered state. For example, clicking on a node that represents multiple rows selects these rows on grid, filter, and other viewers on the view. For more information on manipulation across all viewers in a consistent way, see [Selection]((../viewers.md#selection))

The exception is the current row highlighting since a tree viewer shows aggregated values, not single ones.

GIF (showing the interaction between tree viewer, scatterplot, filter, and grid using all action, listed above)

## Tree viewer as filter

You can use a tree viewer for filtering the underlying table which is convinient for interactive [dashboards](../dashboard.md).

GIF (showing the interaction between tree viewer as a filter and grid, see viewers/filtering)

## Embedding
<!--(check!!)-->

Each viewer created in Datagrok can be embedded into an external site as an iframe.
>Note: Upload and publish your [project](../../Datagrok/project.md) first

GIF (showing how to embed the viewer)

## See also

* [Table view](../../datagrok/table-view.md)
* [Viewers](../viewers.md)
* View
* [Dashboards](../dashboard.md)
* [Context Pane](../../datagrok/navigation.md#properties)
* [Project](../../datagrok/project.md)
