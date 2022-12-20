import {category, expect, test} from '@datagrok-libraries/utils/src/test';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';


category('detectors', () => {
  test('detectNucleotides', async () => {
    const table = DG.DataFrame.fromCsv(
      `sequence, id
      GATTACA, 1997
      ATTCGGA, 1984
      TTTAGGC, 2021`);

    const column = table.columns.byName('sequence');
    await grok.data.detectSemanticTypes(table);
    await expect(column.semType, 'dna_nucleotide');
  });

  test('detectEnaId', async () => {
    const table = DG.DataFrame.fromCsv(
      `enaID
      LR794596
      AA046425
      LR794608
      AA000000`);

    const column = table.columns.byName('enaID');
    await grok.data.detectSemanticTypes(table);
    await expect(column.semType, 'EnaID');
  });
});
