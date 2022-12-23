import {before, category, expect, test} from '@datagrok-libraries/utils/src/test';

import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

const packageName = 'DmytroSequence';

category('Subsequence count', () => {
  //asynchronous script names
  const pythonSubsequenceScriptName = 'CountSubsequencePython';
  const pythonDataframeSubsequenceScriptName = 'CountSubsequencePythonDataframe';
  const jsSubsequenceScriptName = 'CountSubsequenceJS';

  //sequences dataframe
  const pythonDataframeSubsequenceTable = DG.DataFrame.fromCsv(
    `GenBank,Sequence
    MT079845.1,ctacaagaga tcgaaagttg gttggtttat accttcccag gtaacaaacc aaccaacttt cgatctcttg tagatctgtt ctctaaacga
    MT079851.1,attaaaggtt tataccttcc caggtaacaa accaaccaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg
    MT326187.1,gtcaaaggtt tataccttcc caggtaacaa accaaccaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg
    MT358734.1,aagtaaggtt tataccttcc caggtaacaa accaaccaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg
    MT385490.1,aacaaaccaa ccaactttcg atctcttgta gatctgttct ctaaacgaac tttaaaatct gtgtggctgt cactcggctg catgcttagt
    MT412305.1,attaaaggtt tataccttcc caggtaacaa accaatcaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg`);

  //asynchronous script results
  let pythonSubsequenceScriptResult: number;
  let pythonSubsequenceScriptResultWithOverlapping: number;
  let pythonDataframeSubsequenceScriptResult: DG.DataFrame;
  let pythonDataframeSubsequenceScriptResultWithOverlapping: DG.DataFrame;
  let jsSubsequenceScriptResult: number;
  let jsSubsequenceScriptResultWithOverlapping: number;

  before(async () => {
    pythonSubsequenceScriptResult = await grok.functions.call(`${packageName}:${pythonSubsequenceScriptName}`,
      {'sequence': 'ATGATC', 'subsequence': 'AT'});

    pythonSubsequenceScriptResultWithOverlapping = await grok.functions
      .call(`${packageName}:${pythonSubsequenceScriptName}`, {'sequence': 'ctacaagaga', 'subsequence': 'aga'});

    pythonDataframeSubsequenceScriptResult = await grok.functions.call(`${packageName}:
      ${pythonDataframeSubsequenceScriptName}`, {'sequences': pythonDataframeSubsequenceTable, 'columnName': 'Sequence',
      'subsequence': 'acc'});

    pythonDataframeSubsequenceScriptResultWithOverlapping = await grok.functions.call(`${packageName}:
      ${pythonDataframeSubsequenceScriptName}`, {'sequences': pythonDataframeSubsequenceTable, 'columnName': 'Sequence',
      'subsequence': 'aga'});

    jsSubsequenceScriptResult = await grok.functions.call(`${packageName}:${jsSubsequenceScriptName}`,
      {'sequence': 'ATGATC', 'subsequence': 'AT'});

    jsSubsequenceScriptResultWithOverlapping = await grok.functions.call(`${packageName}:${jsSubsequenceScriptName}`,
      {'sequence': 'ctacaagaga', 'subsequence': 'aga'});
  });


  test('pythonSubsequenceScriptWorksCorrectly', async () => {
    await expect(pythonSubsequenceScriptResult, 2);
  });

  test('pythonSubsequenceScriptWorksCorrectlyWithOverlapping', async () => {
    await expect(pythonSubsequenceScriptResultWithOverlapping, 2);
  });

  test('pythonDataframeSubsequenceScriptWorksCorrectly', async () => {
    const expectedTable = DG.DataFrame.fromCsv(
      `N(acc)
      3
      3
      3
      3
      1
      2`);

    await expect(pythonDataframeSubsequenceScriptResult.toCsv(), expectedTable.toCsv());
  });

  test('pythonDataframeSubsequenceScriptWorksCorrectlyWithOverlapping', async () => {
    const expectedTable = DG.DataFrame.fromCsv(
      `N(aga)
      3
      1
      1
      1
      0
      1`);

    await expect(pythonDataframeSubsequenceScriptResultWithOverlapping.toCsv(), expectedTable.toCsv());
  });

  test('jsSubsequenceScriptWorksCorrectly', async () => {
    await expect(jsSubsequenceScriptResult, 2);
  });

  test('jsSubsequenceScriptWorksCorrectlyWithOverlapping', async () => {
    await expect(jsSubsequenceScriptResultWithOverlapping, 2);
  });
});
