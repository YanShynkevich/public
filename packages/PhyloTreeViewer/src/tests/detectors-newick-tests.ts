import * as grok from 'js-api/grok';
import * as ui from 'js-api/ui';
import * as DG from 'js-api/dg';
import * as bio from 'libraries/bio';

import {after, before, category, test, expect, expectObject} from '@datagrok-libraries/utils/src/test';
import {DfReaderFunc, readAndDetect} from '@datagrok-libraries/utils/src/test';

export async function detectNewickGetFunc(): Promise<DG.Func> {
  const funcList: DG.Func[] = DG.Func.find({package: 'Bio', name: 'detectNewick'});
  const resFunc: DG.Func = funcList[0];

  // warm up the detector function
  const col: DG.Column = DG.Column.fromStrings('tree', [';', '();', '(a);']);
  await resFunc.prepare({col: col}).call();

  return resFunc;
}

category('detectNewick', () => {
  let detectFunc: DG.Func;

  const enum Tests {

  };

  before(async () => {
    detectFunc = await detectNewickGetFunc();
  });

  test('newickNoLength', async () => {
    _testPos();
  });


  async function _testPos(dfReader: DfReaderFunc, colName: string) {
    const col: DG.Column = await readAndDetect(dfReader, colName, detectFunc);

    if (col.semType !== 'Newick' /*DG.SEMTYPE.NEWICK*/) {
      const errMsg = `Positive test missed semType='${'Newick'/*DG.SEMTYPE.NEWICK*/}'.`;
      throw new Error(errMsg);
    }

    // TODO: Extra checks for supplemented column tags
  }

  async function _testNeg(dfReader: DfReaderFunc, colName: string) {
    const col: DG.Column = await readAndDetect(dfReader, colName, detectFunc);

    if (col.semType === 'Newick' /*DG.DEMTYPE.NEWICK*/) {
      const errMsg = `Negative test detected semType='${col.semType}'.`;
      throw new Error(errMsg);
    }
  }
});
