import {category, expect, test} from '@datagrok-libraries/utils/src/test';
import {complement} from '../package';


category('NucleotideConversion', () => {
  test('complementWorksCorrectly', async () => {
    await expect(complement('ATGCGCTAGCTCATTT'), 'TACGCGATCGAGTAAA');
  });

  test('complementThrowsError', async () => {
    await expect(complement('ARTQDF'), 'String is not a nucleotide.');
  });
});
