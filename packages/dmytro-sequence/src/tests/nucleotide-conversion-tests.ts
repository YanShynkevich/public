import {category, expect, test} from '@datagrok-libraries/utils/src/test';

import {complement} from '../package';

category('NucleotideConversion', () => {
  test('uppercaseComplementWorksCorrectly', async () => {
    await expect(complement('ATGCGCTAGCTCATTT'), 'TACGCGATCGAGTAAA');
  });

  test('lowercaseComplementWorksCorrectly', async () => {
    await expect(complement('atgcgctagctcattt'), 'tacgcgatcgagtaaa');
  });

  test('complementSequencesWorksCorrectly', async () => {
    await expect(complement('atgcgctagctcattt atgctgctattcgact'), 'tacgcgatcgagtaaa tacgacgataagctga');
  });

  test('complementThrowsError', async () => {
    await expect(complement('ARTQDF'), 'String is not a nucleotide.');
  });
});
