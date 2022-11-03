/* Do not change these import lines to match external modules in webpack configuration */
//import * as grok from 'datagrok-api/grok';
//import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {BioStructureViewer} from './biostructure-viewer';
import {byId, byData} from './viewers/molstar-viewer';
import {PdbRenderer} from './utils/cell-renderer';
import {MolViewer} from './mol-viewer';
import {pdb} from './viewers/bdq';

export const _package = new DG.Package();

//name: pdbCellRenderer
//tags: cellRenderer
//meta.cellType: xray
//meta.columnTags: quality=xray
//output: grid_cell_renderer result
export function xRayCellRenderer(): PdbRenderer {
  return new PdbRenderer();
}

//name: BioStructure Viewer
//tags: app
export async function biostructureApp() {
  const pi = DG.TaskBarProgressIndicator.create('Opening BioStructure Viewer');
  const app = new BioStructureViewer();
  await app.init();
  pi.close();
}

//name: Mol* BioStructure Viewer Id.
//tags: viewer
//input: string pdbID
export async function molstarViewId(pdbID: string) {
  const pi = DG.TaskBarProgressIndicator.create('Opening BioStructure* Viewer Id');
  await byId(pdbID);
  pi.close();
}

//name: Mol* BioStructure Viewer Data.
//tags: viewer
export async function molstarViewData() {
  const pi = DG.TaskBarProgressIndicator.create('Opening BioStructure* Viewer Data');
  //const pdbData = await _package.files.readAsText('1bdq.pdb');
  await byData(pdb);
  pi.close();
}

//name: MolViewer
//description: Creates MolViewer viewer
//tags: viewer
//output: viewer result
export function _MolViewer() {
  return new MolViewer();
}

