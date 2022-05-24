import {after, before, category, delay, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {checkHTMLElement} from '../ui/utils';
import {isColumnPresent, isViewerPresent, isDialogPresent, returnDialog, setDialogInputValue} from './gui-utils';

category('Dialog: Aggregate Rows', () => {
    let v: DG.TableView;
    let demog = grok.data.demo.demog(1000);

    before(async () => {
        v = grok.shell.addTableView(await demog);
    });

   test('dialogs.aggregateRows', async () => {
        grok.shell.topMenu.find('Data').find('Aggregate Rows...').root.click(); await delay(1000);

        let okButton = document.getElementsByClassName('ui-btn ui-btn-ok')[0] as HTMLElement;
        okButton!.click(); await delay(2000);
       
        function  isTablePresent(){
            let check = false;
            for(let i=0; i<grok.shell.tables.length; i++){                
                if (grok.shell.tables[i].name == 'result'){   
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
        v.close();
        grok.shell.closeAll();
    });

});
