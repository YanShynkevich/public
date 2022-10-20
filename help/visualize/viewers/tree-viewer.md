# Tree viewer

The tree viewer visualizes the hierarchical structure of a dataset's categorical data. Each node within the same hierarchy level corresponds to a category within one column. It also shows the number of rows containing this category. The branches between nodes of different levels form a tree network providing hierarchical data insights.

Initially, the chart builds a tree structure with up to three levels selecting columns with the least number of categories. You can change the order of columns, add new levels to the initial hierarchy or remove the existing ones using [settings](tree-viewer.md#settings) available from the UI.

To apply a tree viewer to a given dataset, on the menu ribbon, click **Add viewer** icon and select **Tree viewer** in the opened window.

>Note: viewer for sequences

## Interaction

## Layouts

## Filtering

## Docking

## Settings

The tree viewer settings are available from the To change the order of columns, add new levels to the initial hierarchy or
remove the existing ones, edit the viewer's **Hierarchy** property. Also, in the
viewer properties, you can adjust marker settings, change a tree layout, or
toggle certain behaviors, such as animation, expanding or collapsing nodes, etc.

To learn more about all viewers' properties, see [Properties](../viewers.md#properties).

> Developers: To learn more about tree diagram properties, see [Tree Diagram](https://echarts.apache.org/en/option.html#series-tree) library documentation.

## Actions

|                     |                        |
|---------------------|------------------------|
| Node: click         | Expand/collapse branch |
| Node: ctrl+click    | Invert node selection  |
| Node: shift+click   | Add node to selection  |

For the complete list of actions, see
[Common actions](../viewers.md#common-actions)

GIF

See also:

* [Viewers](../viewers.md)
