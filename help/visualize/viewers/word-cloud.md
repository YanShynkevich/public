<!-- TITLE: Word cloud -->
<!-- SUBTITLE: -->

# Word cloud

Word cloud (a tag cloud) shows word frequency. The most frequently used words
appear larger than the others, providing a quick summary and visualization of
word data. Use it to see the most popular concepts, highlight important textual
data points, compare data, etc.

![Word Cloud](word-cloud.png "Word Cloud")

## Add a word cloud

1. Go to **Tables** and expand the **Viewers** panel.
1. Locate the **Word Cloud** icon and click it.

When you add the viewer, it builds a word cloud based on the first column of the
string type.

## Configuring a word cloud

To configure a word cloud, click the **Gear** icon on top of the viewer and use
the info panels on the **Context Pane**. For example, you can:

* Set the data for displaying a word cloud. Choose the corresponding column from
  the dropdown list in **Word**.
* Size-code and color-code words. Define a column for aggregation in **Size**
  and **Color** and select an aggregation function in **Size Column Aggr Type**
  and  **Color Column Aggr Type**.
* Set min and max font sizes using **Min Size** and **Max size**.
* Limit the number of words to appear in a cloud using **Max Words**.
* Set the background color for the viewer using **Back Color**.

## Interaction with other viewers

A word cloud viewer doesn’t respond to the row selection and data filtering;
however, it filters grid and other viewers.

## Viewer controls

|Action              |        Control                |
|------------------------|----------------------|
| See the number of rows / highlight the corresponding rows in other viewers | Hover over the word |
| Add a word to selection                |Click the word                  |

## See also

* [Viewers](../viewers.md)
* [Table View](../../datagrok/table-view.md)
* [JS API: Word cloud](https://public.datagrok.ai/js/samples/ui/viewers/types/word-cloud)
