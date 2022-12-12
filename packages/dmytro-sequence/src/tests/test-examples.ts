import {category, expect, test} from '@datagrok-libraries/utils/src/test';


category('Examples', () => {
  test('chemSpaceOpens', async () => {
    await _testChemSpaceReturnsResult(smallDf, 'UMAP');
  });

  test('Success', async () => {
    expect(1, 1);
  });

  test('Fail', () => {
    throw 'Exception';
  });

  test('Skipped', async () => {
    expect(1 === 1, false);
  }, {skipReason: 'TASK-ID'});
});
