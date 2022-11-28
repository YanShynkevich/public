// This file may not be used in
import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';
import {getRdKitModule, getRdKitWebRoot} from '../utils/chem-common-rdkit';
import {RDModule, RDMol, SubstructLibrary} from '@datagrok-libraries/chem-meta/src/rdkit-api';

let rdkitModule: RDModule | null = null;
let alertsDf: DG.DataFrame | null = null;
let alertsMolList: RDMol[] | null = null;

export async function checkForStructuralAlerts(molCol: DG.Column<string>): Promise<void> {
  rdkitModule ??= getRdKitModule();
  alertsDf ??= await grok.data.loadTable(getRdKitWebRoot() + 'files/alert-collection.csv');

  const ruleSetNameCol = alertsDf.getCol('rule_set_name');
  const ruleSetNameColCategories = ruleSetNameCol.categories;
  const dialog = ui.dialog('Structural Alerts');
  for (const ruleSet of ruleSetNameColCategories)
    dialog.add(ui.boolInput(ruleSet, true));
  
  dialog.onOK(() => {
    const progress = DG.TaskBarProgressIndicator.create('Checking for structural alerts...');
    const ruleSetIndexList = dialog.inputs
      .filter((input) => input.value)
      .map((input) => ruleSetNameColCategories!.indexOf(input.caption));
    if (ruleSetIndexList.length == 0)
      return;
    runStructuralAlertsDetection(ruleSetIndexList, molCol, ruleSetNameCol, rdkitModule!, alertsMolList!);
    progress.close();
  });

  // Caching the molecules
  if (alertsMolList == null) {
    const smartsCol = alertsDf.getCol('smarts');
    const smartsColData = smartsCol.getRawData();
    const smartsColCategories = smartsCol.categories;
    const alertsDfLen = alertsDf.rowCount;
    alertsMolList = new Array(alertsDfLen);

    for (let i = 0; i < alertsDfLen; i++)
      alertsMolList[i] = rdkitModule.get_qmol(smartsColCategories[smartsColData[i]]);
  }

  dialog.show();
}

export function runStructuralAlertsDetection(ruleSetIdxList: number[], molCol: DG.Column<string>,
  ruleSetNameCol: DG.Column<string>, rdkitModule: RDModule, alertsMolList: RDMol[]): DG.DataFrame {
  const colInfoList: (Int32Array | Float32Array | Float64Array | Uint32Array)[] = new Array(Math.max(...ruleSetIdxList));
  const ruleSetNameColCategories = ruleSetNameCol.categories;
  const df = molCol.dataFrame;
  const dfCols = df.columns;
  for (const ruleSetIdx of ruleSetIdxList) {
    const ruleSetName = ruleSetNameColCategories![ruleSetIdx];
    colInfoList[ruleSetIdx] = (df.col(ruleSetName) ?? dfCols.addNewBool(ruleSetName)).getRawData();
  }

  const originalDfLength = df.rowCount;
  const ruleSetNameColData = ruleSetNameCol.getRawData();
  const molColData = molCol.getRawData();
  const molColCategories = molCol.categories;
  const nullMolIdx = molColCategories.indexOf('');

  //@ts-ignore: wrong interface
  const lib: SubstructLibrary = new rdkitModule!.SubstructLibrary();
  const indexMap: Map<number, number> = new Map();

  for (let i = 0; i < originalDfLength; i++) {
    const currentMolIdx = molColData[i];
    if (currentMolIdx != nullMolIdx)
      indexMap.set(lib.add_mol(rdkitModule!.get_mol(molColCategories[currentMolIdx])), i);
  }

  let matches: number[];
  for (let i = 0; i < alertsMolList.length!; i++) {
    const currentRuleSetNameCategoryIdx = ruleSetNameColData[i];
    if (!ruleSetIdxList.includes(currentRuleSetNameCategoryIdx))
      continue;

    try {
      matches = JSON.parse(lib.get_matches(alertsMolList![i]));
    } catch (e) {
      console.warn(`StructuralAlertsError: ${e}`);
      continue;
    }

    const currentRuleSetColData = colInfoList[currentRuleSetNameCategoryIdx];
    for (const libIndex of matches)
      currentRuleSetColData[indexMap.get(libIndex)!] = 1;
  }

  return df;
}
