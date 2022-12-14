import {before, category, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';
import {getOrders} from '../package';


const packageName = 'DmytroSequence';

category('DatabaseQueries', () => {
  const queryName = 'ordersByCountry';

  let queryResult: DG.DataFrame;
  let jsFunctionQueryResult: DG.DataFrame;

  before(async () => {
    queryResult = await grok.data.query(`${packageName}:${queryName}`, {country: 'Belgium'})
      .then((result) => {return result;});
    queryResult.col('sum')!.tags[DG.TAGS.FORMAT] = '#.0000000000000';

    jsFunctionQueryResult = await getOrders().then((result) => {return result;});
    jsFunctionQueryResult.col('sum')!.tags[DG.TAGS.FORMAT] = '#.0000000000000';
  });

  test('queryWorksCorrectly', async () => {
    const expectedTable = DG.DataFrame.fromJson(`[
      {
        "customerid": "SUPRD",
        "sum": 821.22998046875
      },
      {
        "customerid": "MAISD",
        "sum": 458.9100036621094
      }
    ]`);
    expectedTable.col('sum')!.tags[DG.TAGS.FORMAT] = '#.0000000000000';

    await expect(queryResult.toCsv(), expectedTable.toCsv());
  });

  test('jsFunctionQueryWorksCorrectly', async () => {
    const expectedTable = DG.DataFrame.fromCsv(
      `customerid,sum
      LONEP,79.86000061035156
      OLDWO,983.530029296875
      RATTC,2134.2099609375
      LAZYK,19.399999618530273
      THEBI,262.0899963378906
      THECR,129.9600067138672
      SPLIR,558.6699829101562
      SAVEA,6683.7001953125
      LETSS,202.11000061035156
      GREAL,1087.6099853515625
      HUNGC,207.0800018310547
      WHITC,1353.06005859375
      TRAIH,70.01000213623047`);
    expectedTable.col('sum')!.tags[DG.TAGS.FORMAT] = '#.0000000000000';

    await expect(jsFunctionQueryResult.toCsv(), expectedTable.toCsv());
  });
});
