import {category, expect, test} from '@datagrok-libraries/utils/src/test';
import {complement} from '../package';


category('NucleotideConversion', () => {
  test('complementWorksProperly', async () => {
    expect(complement('ATGCGCTAGCTCATTT'), 'TACGCGATCGAGTAAA');
  });

  test('complementThrowsError', async () => {
    expect(complement('ARTQDF'), 'String is not a nucleotide.');
  });
});
