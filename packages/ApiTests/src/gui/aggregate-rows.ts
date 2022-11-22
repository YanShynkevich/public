import {after, before, awaitCheck ,category, delay, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {checkHTMLElement} from '../ui/utils';
import {isColumnPresent, isViewerPresent, isDialogPresent, returnDialog, setDialogInputValue, waitForElement} from './gui-utils';

category('GUI: Aggregate Rows', () => {
  let v: DG.TableView;
  const demog = grok.data.demo.demog(1000);

  before(async () => {
    v = grok.shell.addTableView(demog);
  });

  test('dialogs.aggregateRows', async () => {
    grok.shell.topMenu.find('Data').find('Aggregate Rows...').click(); 
    await awaitCheck(() => {return document.querySelector('.grok-pivot') != undefined}); 

    let okButton:HTMLElement | undefined;
    let button;
    for (let i=0; i<document.getElementsByClassName('ui-btn ui-btn-ok').length; i++) {
      button = document.getElementsByClassName('ui-btn ui-btn-ok')[i] as HTMLElement;
      if (button.innerText == 'OK')
        okButton = button;
    }
    okButton!.click();
    await awaitCheck(() => {return grok.shell.v.name == "result"}); 

    function isTablePresent() {
      let check = false;
      for (let i=0; i<grok.shell.tables.length; i++) {
        if (grok.shell.tables[i].name == 'result') {
          check = true;
          break;
        }
      }
      if (check == false)
        throw 'Aggregation table was not created';
    }

    isTablePresent();
  });

  after(async () => {
    grok.shell.closeAll();
  });
});
