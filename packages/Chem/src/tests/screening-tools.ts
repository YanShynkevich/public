import * as DG from 'datagrok-api/dg';
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import {category, test, expect, delay, expectFloat, before} from '@datagrok-libraries/utils/src/test';
import {_package} from '../package-test';
import * as chemCommonRdKit from '../utils/chem-common-rdkit';
import {runStructuralAlertsDetection} from '../panels/structural-alerts';
import {RDMol} from '@datagrok-libraries/chem-meta/src/rdkit-api';
import {elementalAnalysis} from '../../src/package';


category('screening tools benchmarks', () => {
  before(async () => {
    chemCommonRdKit.setRdKitWebRoot(_package.webRoot);
    chemCommonRdKit.initRdKitModuleLocal();
  });

  test('structural alerts', async () => {
    const alertsDf = DG.DataFrame.fromCsv(await _package.files.readAsText('alert-collection.csv'));
    const alertsDfLen = alertsDf.rowCount;
    const ruleSetNameCol = alertsDf.getCol('rule_set_name');
    const smartsCol = alertsDf.getCol('smarts');
    const smartsColData = smartsCol.getRawData();
    const smartsColCategories = smartsCol.categories;
    const rdkitModule = chemCommonRdKit.getRdKitModule();

    const alertsMolList: RDMol[] = new Array(alertsDfLen);
    for (let i = 0; i < alertsDfLen; i++)
      alertsMolList[i] = rdkitModule.get_qmol(smartsColCategories[smartsColData[i]]);

    const sarSmall = DG.DataFrame.fromCsv(await _package.files.readAsText('smiles.csv'));
    const smilesCol = sarSmall.getCol('canonical_smiles');
    const ruleSetList = ruleSetNameCol.categories.map((_, i) => i);

    DG.time('Structural Alerts', () => {
      runStructuralAlertsDetection(ruleSetList, smilesCol, ruleSetNameCol, rdkitModule, alertsMolList);
    });
  }, {skipReason: '#1193'});

  test('elementalAnalysis', async () => {
    const df: DG.DataFrame = DG.DataFrame.fromCsv(await _package.files.readAsText('test.csv'));
    const col: DG.Column = df.getCol('molecule');
    DG.time('Elemental Analysis', async () => {
      await elementalAnalysis(df, col, false, false);
    });
  })
});
