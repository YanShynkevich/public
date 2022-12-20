import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {after, before, category, test, expect, expectObject} from '@datagrok-libraries/utils/src/test';
import {testsData, Tests} from './consts/newick-tests-consts';
import {phylotreeNewickParser} from '../utils';

category('newickParser_phylotree', () => {
  test(Tests.nwk0, async () => {
    const testData = testsData[Tests.nwk0];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk0NamedRoot, async () => {
    const testData = testsData[Tests.nwk0NamedRoot];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk1NoNameNoHeight, async () => {
    const testData = testsData[Tests.nwk1NoNameNoHeight];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk1NameNoHeight, async () => {
    const testData = testsData[Tests.nwk1NoNameNoHeight];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk1NameHeight, async () => {
    const testData = testsData[Tests.nwk1NoNameNoHeight];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk1NoNameHeight, async () => {
    const testData = testsData[Tests.nwk1NoNameNoHeight];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk3LeafsNoHeight, async () => {
    const testData = testsData[Tests.nwk1NoNameNoHeight];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  test(Tests.nwk3LeafsIntNodesNoHeight, async () => {

    const testData = testsData[Tests.nwk1NoNameNoHeight];
    _testPhylotreeNewickToObject(testData.nwk, testData.obj);
  });

  function _testPhylotreeNewickToObject(nwk: string, tgtObj: Object) {
    const resObj = phylotreeNewickParser(nwk);
    expect(resObj.error, null);
    // excessive props in actual obj will not be controlled
    expectObject(resObj.json, tgtObj);
  }

});