import {after, before, category, delay, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
// import {checkHTMLElement} from './utils';


category('UI: Users', () => {
  // let V: DG.View;
  let v: DG.ViewBase;
  let tb: HTMLElement;

  before(async () => {
    // V = grok.shell.newView('');
    const mng: DG.TabPane = grok.shell.sidebar.getPane('Manage');
    const usel = mng.content.querySelector('[data-view=users]') as HTMLElement;
    if (usel === null) throw 'Users Error!';
    await usel.click();
    v = grok.shell.v;
    tb = v.toolbox;
    const filters = Array.from(tb.querySelectorAll('div.d4-accordion-pane-header'))
      .find(el => el.textContent === 'Filters') as HTMLElement;
    
    if (filters === undefined) throw 'Filters Error!';

    if (!filters.classList.contains('expanded')) await filters.click();
  });


  test('filters.all', async () => {
    const all = Array.from(tb.querySelectorAll('label'))
			.find(el => el.textContent === 'All') as HTMLElement;
    if (all === undefined) throw 'All Error!';
    all.click();
  });


  test('filters.recentlyJoined', async () => {
    const rj = Array.from(tb.querySelectorAll('label'))
      .find(el => el.textContent === 'Recently joined') as HTMLElement;
    if (rj === undefined) throw 'Recently Joined Error!';
    rj.click();
  });


  after(async () => {
    // V.close();
    v.close();
  });
});