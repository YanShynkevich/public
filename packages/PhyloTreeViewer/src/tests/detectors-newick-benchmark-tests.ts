import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {after, before, category, test, expect, expectObject, benchmark} from '@datagrok-libraries/utils/src/test';
import {detectNewickGetFunc} from './detectors-newick-tests';

const DETECT_MAX_ET = 10;

category('detectNewickBenchmark', () => {
  let detectFunc: DG.Func;

  before(async () => {
    detectFunc = await detectNewickGetFunc();
  });

  test('testShorts50Few50', async () => {
    const et: number = await detectNewickBenchmark(DETECT_MAX_ET, 50, 50);
  });

  test('testLong1E5Few50', async () => {
    const et: number = await detectNewickBenchmark(DETECT_MAX_ET, 50, 50);
  });

  test('testShorts50Many1E5', async () => {
    const et: number = await detectNewickBenchmark(DETECT_MAX_ET, 50, 50);
  });


  async function detectNewickBenchmark(
    maxET: number, length: number, count: number
  ): Promise<number> {
    return await benchmark<DG.FuncCall, DG.Column>(10,
      (): DG.FuncCall => {
        const col: DG.Column = generate(length, count);
        const detectFuncCall: DG.FuncCall = detectFunc.prepare({col: col});
        return detectFuncCall;
      },
      async (detectFuncCall: DG.FuncCall): Promise<DG.Column> => {
        return testDetector(detectFuncCall);
      },
      (col: DG.Column) => {
        checkDetectorRes(col);
      });
  }

  function generate(length: number, count: number): DG.Column {
    const treeList: string[] = Array<string>(count);

    return DG.Column.fromStrings('tree', treeList);
  }

  function testDetector(funcCall: DG.FuncCall): DG.Column {
    funcCall.callSync();
    const semType = funcCall.getOutputParamValue();

    const col: DG.Column = funcCall.inputs.col;
    if (semType) col.semType = semType;
    return col;
  }

  function checkDetectorRes(col: DG.Column): void {
    //TODO: some checks required
  }
});