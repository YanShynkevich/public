<!-- TITLE: Map viewer -->
<!-- SUBTITLE: -->

# Map viewer

Map viewer shows arbitrary geospatial data on a map. Use it to display your custom data or open files in geographic formats, like  KML, KMZ, or GeoJSON, on a map. You can create multiple layers by uploading data from different files.

## Add a map viewer

1. Go to **Tables** and expand the **Viewers** panel.
1. Locate the **Map Viewer** icon and click it.

When you add a map viewer, it recognizes columns with geographic semantic types and converts rows to points on a map.

## Configuring a map viewer

 To configure a map, click the **Gear** icon on top of the viewer and use the info panels on the **Context Pane**. For example, you can:

* Toggle the tooltip visibility via **Show Tooltip**.
* Color-code and size-code data points on a map by choosing corresponding columns from the dropdown lists under the **Color** and **Size** settings.
* Set the min and max values for displaying markers when size coding data points. To do that, use the **Marker Min Size** and **Marker Max Size** settings.
* Add a heatmap layer using one of these methods:
  * On the **Context Pane**, set the **Render type** setting to `heatmap`.
  * Switch to the **Extended UI** mode by right-clicking the map viewer and selecting **Extended UI** from the context menu. A toolbar with menu options appears on the top of the viewer.  On the toolbar, click the **Build heatmap for data** icon.

GIF

## Working with layers

A map viewer separates different types of geospatial data into layers. For example, you can manipulate the data points and heatmap separately.

To work with layers, right-click a map viewer and select **Extended UI**. A toolbar and a layers management panel appear. Use them to delete layers, toggle their visibility, and more. For example, you can:

* **Add arbitrary geographical data as a layer.** A map viewer renders geometries in data, such as points, lines, or polygons, as markers, polylines, and areas. To add a layer, upload the corresponding file:
  1. On the toolbar, click the **Upload geo File** icon. A dialog opens.
  1. In the dialog, locate the file and double-click it.
  >Note: To upload a file from your local host, drag and drop it into a map viewer.
* **Select data points within the area**, if a layer shows areas on a map:
  1. Select the area on the layer.
  1. On the top toolbar, click the **Select markers by area** icon.

* **Export data to a new table:**

  * **To export layer content**, on the layers management panel, click the **Export layer data to table** icon.
  * **To export selected data**, on the top toolbar, click the **Export selected markers to new table** icon.

GIF

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
