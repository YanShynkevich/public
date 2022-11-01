import * as DG from 'datagrok-api/dg';
import {byData} from './viewers/molstar-viewer';
import {_package} from './package';

// See also https://datagrok.ai/help/develop/how-to/develop-custom-viewer
// This viewer does the following:
// * listens to changes of filter and selection in the attached table,
// * updates the number of filtered/selected rows accordingly.
export class MolViewer extends DG.JsViewer {
  async onTableAttached() {
    this.subs.push(this.dataFrame!.selection.onChanged.subscribe((_) => this.render()));
    this.subs.push(this.dataFrame!.filter.onChanged.subscribe((_) => this.render()));

    this.render();
  }

  constructor() {super();}

  async render() {
    const pdbData = await _package.files.readAsText('1bdq.pdb');
    const pi = DG.TaskBarProgressIndicator.create('Opening BioStructure* Viewer Data');
    await byData(pdbData);
    pi.close();
    this.root.innerHTML =
      `${this.dataFrame!.toString()}<br>
            Selected: ${this.dataFrame!.selection.trueCount}<br>
            Filtered: ${this.dataFrame!.filter.trueCount}`;
  }
}
