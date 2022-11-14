<!-- TITLE: Map viewer -->
<!-- SUBTITLE: -->

# Map viewer

Map viewer shows geographic data on a map. It recognizes geographic data from
a table or opens files in the geographic data display formats. You can
overlay data from multiple files using map layers.

## Add a map viewer

1. Go to **Tables** and expand the **Viewers** panel.
1. Locate the **Map Viewer** icon and click it.

When you add a map viewer, it recognizes columns with geographic
semantic types and converts rows to the points on a map. All data relevant to a
data point is shown in a tooltip.

## Configuring a map viewer

To configure map, click the **Gear** icon on top of the viewer and use info
panels on the **Context Pane**. For example, you can:

* Color-code and size-code data points on map by choosing corresponding columns
  from the dropdown lists in **Color** and **Size**.
* When size coding data points, you can set the min and max values for
  displaying markers in **Marker Min Size** and **Marker Max Size**.
* Identify the trends or patterns of geographic data at a glance by setting
  **Render type** as `heat map`.

### Working with layers

By default, a map viewer has three layers showing a map, all data points, and
selected data points separately. When added, a heatmap is also displayed as a
separate layer. To add new data as a layer, drag and drop the corresponding file
into a map viewer.

To work with layers, right-click a map viewer and select **Extended UI**. A
toolbar and a layers management panel appear. Use them to delete layers, toggle
their visibility, and more.

For example:

* On a toolbar, you can:
  * Add a heatmap as a separate layer by clicking the **Build heatmap for data** icon.
  * Create a new table with selected data by clicking the **Export selected markers to new table** icon.
  * Select markers by area.
* On a layers management panel, you can:
  * Create a new table with layer content by clicking the **Export layer data to table** icon.

## Interaction with other viewers

A map viewer responds to data filters and rows selection.

## Viewer controls

|Action              |        Control                |
|------------------------|----------------------|
| Zoom in                                            | Mouse Wheel Up or Plus          |
| Zoom out                                         | Mouse Wheel Down or Minus  |
| Add a point to selection   | Shift+Click the point                   |
| Select multiple points                    | Ctrl+Mouse Drag                       |

## See also

* [Viewers](../viewers.md)
* [Globe](globe.md)
