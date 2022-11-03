import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import {pdb} from './viewers/bdq';
//@ts-ignore
import {Viewer} from 'molstar/build/viewer/molstar';
import * as grok from 'datagrok-api/grok';
// @ts-ignore
import {_package} from '../package';

const DefaultViewerOptions = {
  extensions: [],
  layoutIsExpanded: false,
  layoutShowControls: false,
  layoutShowRemoteState: false,
  layoutShowSequence: false,
  layoutShowLog: false,
  layoutShowLeftPanel: false,
  collapseLeftPanel: true,
  collapseRightPanel: true,

  viewportShowExpand: false,
  viewportShowControls: false,

  pdbProvider: 'rcsb',
  emdbProvider: 'rcsb',
};
// See also https://datagrok.ai/help/develop/how-to/develop-custom-viewer
// This viewer does the following:
// * listens to changes of filter and selection in the attached table,
// * updates the number of filtered/selected rows accordingly.
export class MolViewer extends DG.JsViewer {
  viewContainer: HTMLDivElement;

  async onTableAttached() {
    //this.subs.push(this.dataFrame!.selection.onChanged.subscribe((_) => this.render()));
    //this.subs.push(this.dataFrame!.filter.onChanged.subscribe((_) => this.render()));
  }

  constructor() {
    super();

    const viewerContainer = ui.div([], {style: {position: 'absolute', left: '0', right: '0', top: '0', bottom: '0'}});
    this.root.appendChild(viewerContainer);
    this.viewContainer = viewerContainer;
    console.log('variant2', viewerContainer);
    this.init();
  }

  async init() {
    const pi = DG.TaskBarProgressIndicator.create('Creating 3D view');
    this.byData(pdb);
    pi.close();
  }

  initViewer(viewName: string = 'Mol*') {
    return Viewer.create(this.viewContainer, DefaultViewerOptions);
  }

  byData(pdbData: string) {
    this.initViewer().then((v: any) => {
      v.loadPdb(pdbData);
    });
  }

}
