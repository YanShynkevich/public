import * as DG from 'datagrok-api/dg';
import {runTests, TestContext, tests} from '@datagrok-libraries/utils/src/test';

import './tests/nucleotide-conversion-tests';
import './tests/detector-tests';
import './tests/subsequence-count-tests';
import './tests/query-tests';

export let _package = new DG.Package();
export {tests};

//name: test
//input: string category {optional: true}
//input: string test {optional: true}
//input: object testContext {optional: true}
//output: dataframe result
export async function test(category: string, test: string, testContext: TestContext): Promise<DG.DataFrame> {
  const data = await runTests({category, test, testContext});
  return DG.DataFrame.fromObjects(data)!;
}
