<!-- TITLE: Map viewer -->
<!-- SUBTITLE: -->

# Map viewer

Map viewer shows geographic data on a map. It recognizes geographic data from a table or opens files in geographic formats, like  KML, KMZ, and geoJSON. You can overlay data from multiple files using map layers.

## Add a map viewer

1. Go to **Tables** and expand the **Viewers** panel.
1. Locate the **Map Viewer** icon and click it.

When you add a map viewer, it recognizes columns with geographic semantic types and converts rows to points on a map. A tooltip displays all relevant information when you hover over a data point.

>Developers: You can [set the data shown in a tooltip](https://datagrok.ai/help/develop/how-to/column-tooltip.md).

## Configuring a map viewer

To configure a map, click the **Gear** icon on top of the viewer and use the info panels on the **Context Pane**. For example, you can:

* Toggle the tooltip visibility via **Show Tooltip** .
* Color-code and size-code data points on a map by choosing corresponding columns from the dropdown lists in **Color** and **Size**.
* Set the min and max values for displaying markers when size coding data points. To do that, use **Marker Min Size** and **Marker Max Size**.
* Color-code data using heatmap as a layer:
  * From the **Context Pane**: set **Render type** to `heat map`.
  * From the extended UI mode:
    1. Right-click a map viewer and select **Extended UI**.
    1. On the top toolbar, click the **Build heatmap for data** icon.

GIF

You can customize a map by adding layers with the geographic information you need. To add new data as a layer, you can choose one of the following actions:

* Drag and drop the corresponding file into a map viewer.
*

<!--Share a project
Save to layout-->

To work with layers, right-click a map viewer and select **Extended UI**. A toolbar and a layers management panel appear. Use them to delete layers, toggle their visibility, and more.

For example, if an additional layer shows areas on a map, you can select data points within the chosen area:

1. Select the area on the additional layer.
1. On the top toolbar, click the **Select markers by area** icon.

GIF

## Data export

In extended UI mode, you can export the following data to a new table:

* Layer content. On the layers management panel, click the **Export layer data to table** icon.
* Selected data. On the top toolbar, click the **Export selected markers to new table** icon.

## Interaction with other viewers

A map viewer responds to data filters and rows selection.

## Viewer controls

|Action              |        Control                |
|------------------------|----------------------|
| Zoom in                                            | Mouse Wheel Up or Plus          |
| Zoom out                                         | Mouse Wheel Down or Minus  |
| Add a point to selection                | Shift+Click the point                   |
| Select multiple points                    | Ctrl+Mouse Drag                       |

## See also

* [Viewers](../viewers.md)
* [Globe](globe.md)
