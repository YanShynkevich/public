/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {TestViewerForProperties} from './viewers/test-viewer-for-properties';
import { TestCustomFilter } from './viewers/test-custom-filter';
import { errorToConsole } from '@datagrok-libraries/utils/src/to-console';

//name: TestViewerForProperties
//description: Viewer to test properties and others
//tags: viewer, panel
//output: viewer result
export function testViewerForProperties() {
  return new TestViewerForProperties();
}

//name: testCustomFilter
//description: Test custom filter
//tags: filter
//output: filter result
export function testCustomFilter(): DG.Filter {
  try {
    const flt: TestCustomFilter = new TestCustomFilter();
    return flt;
  } catch (err: any) {
    const errMsg: string = 'ApiTests: testCustomFilter() error:\n' + errorToConsole(err);
    console.error(errMsg);
    throw err;
  }
}
