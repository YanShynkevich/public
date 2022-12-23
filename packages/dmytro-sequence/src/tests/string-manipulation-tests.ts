import {category, expect, test} from '@datagrok-libraries/utils/src/test';

import * as DG from 'datagrok-api/dg';
import * as grok from 'datagrok-api/grok';

import {fuzzyJoin} from '../package';
import {substringOccurencesInStringWithOverlapping, extractSubsequencesFromString,
  getSubsequenceCountInColumn} from '../utils/string-manipulation';

category('StringManipulations', () => {
  test('substringOccurencesWorksCorrectly', async () => {
    expect(substringOccurencesInStringWithOverlapping('ctacaagaga', 'aga'), 2);
  });

  test('extractSubsequencesWorksCorrectly', async () => {
    expect(extractSubsequencesFromString('ctacaagaga', 3).toString(),
      ['cta', 'caa', 'gag', 'tac', 'aag', 'aga', 'aca'].toString());
  });

  test('getSubsequenceCountFromColumnWorksCorrectly', async () => {
    const column1 = DG.Column.fromList('string', 'Counts', ['ctacaagaga', 'aaccaacttt']);
    const column2 = DG.Column.fromList('string', 'Counts', ['catgcaaatt', 'cgaataactg']);
    const length = 3;

    expect(getSubsequenceCountInColumn(column1, column2, length).toString(), [1, 3].toString());
  });

  test('fuzzyJoinWorksCorrectly', async () => {
    const expectedTable = DG.DataFrame.fromCsv(
      `Sequence,Counts
      ctacaagaga,1
      aaccaacttt,3
      catgcaaatt,2
      cgaataactg,3`);

    const df1 = DG.DataFrame.fromCsv(
      `Sequence
      ctacaagaga
      aaccaacttt`);
    const df2 = DG.DataFrame.fromCsv(
      `Sequence
      catgcaaatt
      cgaataactg`);
    const subsequenceLength = 3;
    //semantic type detection
    await grok.data.detectSemanticTypes(df1);
    await grok.data.detectSemanticTypes(df2);

    expect(fuzzyJoin(df1, df2, subsequenceLength).toCsv(), expectedTable.toCsv());
  });
});
