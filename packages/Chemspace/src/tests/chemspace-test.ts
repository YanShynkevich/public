import * as DG from 'datagrok-api/dg';
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import './gui-utils';
import {before, after, category, expect, test, delay} from '@datagrok-libraries/utils/src/test';
import { Data, DataFrame } from 'datagrok-api/dg';

category('Chemspace', async () => {
  let chemspaceDf: DG.DataFrame | null = null;

  before(async () => {
    await grok.functions.call('Chemspace:startApp');
    await delay(9000);
    const v = grok.shell.getTableView('Chemspace');
    if (v)
      chemspaceDf = v.dataFrame;
  });

  test('Chemspace.openApp', async () => {
    // await grok.functions.call('Chemspace:startApp');
    // await delay(2000);
    const v = grok.shell.getTableView('Chemspace');
    expect(v.name === 'Chemspace', true);
    // expect(allViews.every(item => grok.shell.view(item) !== undefined), true);
    // expect(allTableViews.every(item => grok.shell.view(item) !== undefined), true);
  });

  test('Chemspace.detectCsId', async () => {
    if (chemspaceDf) {
      const col = chemspaceDf.columns.byName('CS-id');
      await grok.data.detectSemanticTypes(chemspaceDf);
      expect(col.semType, 'chemspace-id');
    }
  });

  after(async () => {
    grok.shell.closeTable(chemspaceDf as DataFrame);
    grok.shell.closeAll();
  });
});

