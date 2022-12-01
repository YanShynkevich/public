import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

/** hierarchicalClustering.py script wrapper (default environment) */
export async function hierarchicalClusteringScript(df: DG.DataFrame, distance: string, linkage: string): Promise<string> {
  // PhyloTreeViewer:hierarchicalClustering is a Python script in scripts/hierarchicalClustering.py
  return await grok.functions.call('PhyloTreeViewer:hierarchicalClustering',
    {data: df, distance_name: distance, linkage_name: linkage});
}