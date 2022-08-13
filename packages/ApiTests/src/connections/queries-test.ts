import {after, category, delay, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';
import {_package} from "../package-test";

category('Connections', () => {
  test('demoQueries', async () => {
    const queries = await grok.dapi.queries.filter(`options.expected != null and "${_package.name}"`).include('params').list();

    for (const query of queries) {
      const call = query.prepare();

      if (query.name == '')
        continue;

      for (const property of query.inputs)
        property.set(call, property.defaultValue == null ? property.defaultValue : await grok.functions.eval(`${property.defaultValue}`));

      await call.call();

      const t = call.getOutputParamValue() as DG.DataFrame;
      if (t == null)
        throw ' Result of ' + query.name + 'is not a DataFrame';

      if (t.rowCount != query.options.testExpected)
        // eslint-disable-next-line no-throw-literal
        throw ' Rows number in' + query.name + 'table is not as expected';
    }
  });
});
