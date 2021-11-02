/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {ModelHandler} from './model_handler';
import {selectOutliersManually} from './outliers_selection';
import {exportFuncCall} from './export_funccall';

export const _package = new DG.Package();

//name: test
export function test() {
  grok.shell.info(_package.webRoot);
}

//tags: init
export function init() {
  console.log('init');
  DG.ObjectHandler.register(new ModelHandler());
}

//name: Model Catalog
//tags: app
export function modelCatalog() {
  const v = DG.CardView.create({dataSource: grok.dapi.scripts, permanentFilter: '#model'});
  v.meta = new ModelHandler();
  v.name = 'Models';
  v.permanentFilter = '#model';
  grok.shell.addView(v);
}

//name: manualOutlierDetectionDialog
//input: dataframe inputData
//output: dataframe augmentedInput
//output: dataframe editedInput
export async function manualOutlierSelectionDialog(inputData: DG.DataFrame) {
  let call = grok.functions.getCurrentCall();
  if (call.aux['interactive']) {
    const {augmentedInput, editedInput} = await selectOutliersManually(inputData);
    return {augmentedInput, editedInput};
  }
  return new Promise<{augmentedInput: DG.DataFrame, editedInput: DG.DataFrame}>((resolve, reject) => {
    resolve({augmentedInput: inputData, editedInput: inputData});
  });
}

//name: export To Excel
//input: funccall call
//tags: export
export function exportToExcel(call: DG.FuncCall) {
  exportFuncCall(call);
}