import {before, category, expect, test} from '@datagrok-libraries/utils/src/test';
import {parseENA} from '../utils/ena-parser';

category('enaParses', () => {
  let correctParseResult: string;

  before(async () => {
    correctParseResult = await parseENA('AA046425');
  });

  test('enaParseWorksCorrectly', async () => {
    // eslint-disable-next-line max-len
    const expectedResult = `>ENA|AA046425|AA046425.1 zk70e11.s1 Soares_pregnant_uterus_NbHPU Homo sapiens cDNA clone IMAGE:488204 3' similar to contains element MIR repetitive element, mRNA sequence.\nATATTTTATCTAATATTTTATTTACTGATCTCTCTGAAACATGCCAAAATTCATATAGCT\nAAGGGAACTTACCATGCTAAAATGCTGTTCAACATGACAAATTTATACAAAACATATTTC\nAATGTAGTGCCTTCATTTCATTCTTGAGGAATCAACATTACATTTAGGTGGTGAAATACA\nAATATAATTATCAAATATCGTACTTCTAGTTTACTGGAAAACATAACAGTTGTGACAGTC\nACACCTAACACCTTGGTTAATTAAAGACAGAAAATGGGCAGGGGTGTCACAGAAGTATGC\nAAGGATTTGACAGTTCAAACTAATCCATAGCCCTTCTGAGAAACTACAGATGGAAAATAT\nGTAGTAAATATTTCTGTAATATGGTGGTTTCAGTACATTATAGCNCAGTGATCATCATTC\nCATTCATACACTCAAATAACTGCTGCTTCTGATCACTGAAAACTAGATTCAAAGTCATTG\nCTCAACAAGCTGATACTACAAATCCCTTATATTAACAGGTAGTTTAAATGTGGAAATAAG\nGCAAGCATACTTGTTAGCACAATACTTCAGATATAATTGAGACNCCTGCTATNCATATTA\nGGTCNCGTTGTATACAAGCTCCATGGTGTGGGGTAATCCCATTNCCTATTTATTTATGGC\nNCACGNTACTTTAGNCCA\n`;
    await expect(correctParseResult, expectedResult);
  });
});
