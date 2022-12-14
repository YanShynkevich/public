import {before, category, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

const packageName = 'DmytroSequence';

category('Subsequence count', () => {
  const pythonSubsequenceScriptName = 'CountSubsequencePython';
  const pythonDataframeSubsequenceScriptName = 'CountSubsequencePythonDataframe';
  const pythonDataframeSubsequenceTable = DG.DataFrame.fromCsv(
    `GenBank,Sequence
    MT079845.1,ctacaagaga tcgaaagttg gttggtttat accttcccag gtaacaaacc aaccaacttt cgatctcttg tagatctgtt ctctaaacga
    MT079851.1,attaaaggtt tataccttcc caggtaacaa accaaccaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg
    MT326187.1,gtcaaaggtt tataccttcc caggtaacaa accaaccaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg
    MT358734.1,aagtaaggtt tataccttcc caggtaacaa accaaccaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg
    MT385490.1,aacaaaccaa ccaactttcg atctcttgta gatctgttct ctaaacgaac tttaaaatct gtgtggctgt cactcggctg catgcttagt
    MT412305.1,attaaaggtt tataccttcc caggtaacaa accaatcaac tttcgatctc ttgtagatct gttctctaaa cgaactttaa aatctgtgtg`);
  const jsSubsequenceScriptName = 'CountSubsequenceJS';

  let pythonSubsequenceScriptResult: Number;
  let pythonDataframeSubsequenceScriptResult: DG.DataFrame;
  let jsSubsequenceScriptResult: Number;

  before(async () => {
    pythonSubsequenceScriptResult = await grok.functions.call(`${packageName}:${pythonSubsequenceScriptName}`,
      {'sequence': 'ATGATC', 'subsequence': 'AT'});

    pythonDataframeSubsequenceScriptResult = await grok.functions.call(`${packageName}:
      ${pythonDataframeSubsequenceScriptName}`, {'sequences': pythonDataframeSubsequenceTable, 'columnName': 'Sequence',
      'subsequence': 'acc'});

    jsSubsequenceScriptResult = await grok.functions.call(`${packageName}:${jsSubsequenceScriptName}`,
      {'sequence': 'ATGATC', 'subsequence': 'AT'});
  });


  test('pythonSubsequenceScriptWorksCorrectly', async () => {
    await expect(pythonSubsequenceScriptResult, 2);
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

  test('jsSubsequenceScriptWorksCorrectly', async () => {
    await expect(jsSubsequenceScriptResult, 2);
  });
});
