import {category, expect, test} from '@datagrok-libraries/utils/src/test';

import {complement} from '../package';

category('NucleotideConversion', () => {
  test('uppercaseComplementWorksCorrectly', async () => {
    expect(complement('ATGCGCTAGCTCATTT'), 'TACGCGATCGAGTAAA');
  });

  test('lowercaseComplementWorksCorrectly', async () => {
    expect(complement('atgcgctagctcattt'), 'tacgcgatcgagtaaa');
  });

  test('complementSequencesWorksCorrectly', async () => {
    expect(complement('atgcgctagctcattt atgctgctattcgact'), 'tacgcgatcgagtaaa tacgacgataagctga');
  });

  test('complementThrowsError', async () => {
    expect(complement('ARTQDF'), 'String is not a nucleotide.');
  });
});
