import * as DG from 'datagrok-api/dg';

import {before, category, expect, test} from '@datagrok-libraries/utils/src/test';
import {parseFastaENA, parseEnaIdByQuery, _fetchENASequence} from '../utils/ena-parser';

category('enaFastaParses', () => {
  let enaFastaParseResult: string;
  let enaIdParseByQueryResult: string;
  let enaSequenceFetchResult: DG.DataFrame;

  before(async () => {
    enaFastaParseResult = await parseFastaENA('AA046425');
    enaIdParseByQueryResult = await parseEnaIdByQuery('coronavirus', 1, 0);
    enaSequenceFetchResult = await _fetchENASequence('coronavirus', 1, 0, 32);
  });

  test('enaFastaParseWorksCorrectly', async () => {
    // eslint-disable-next-line max-len
    const expectedResult = `>ENA|AA046425|AA046425.1 zk70e11.s1 Soares_pregnant_uterus_NbHPU Homo sapiens cDNA clone IMAGE:488204 3' similar to contains element MIR repetitive element, mRNA sequence.\nATATTTTATCTAATATTTTATTTACTGATCTCTCTGAAACATGCCAAAATTCATATAGCT\nAAGGGAACTTACCATGCTAAAATGCTGTTCAACATGACAAATTTATACAAAACATATTTC\nAATGTAGTGCCTTCATTTCATTCTTGAGGAATCAACATTACATTTAGGTGGTGAAATACA\nAATATAATTATCAAATATCGTACTTCTAGTTTACTGGAAAACATAACAGTTGTGACAGTC\nACACCTAACACCTTGGTTAATTAAAGACAGAAAATGGGCAGGGGTGTCACAGAAGTATGC\nAAGGATTTGACAGTTCAAACTAATCCATAGCCCTTCTGAGAAACTACAGATGGAAAATAT\nGTAGTAAATATTTCTGTAATATGGTGGTTTCAGTACATTATAGCNCAGTGATCATCATTC\nCATTCATACACTCAAATAACTGCTGCTTCTGATCACTGAAAACTAGATTCAAAGTCATTG\nCTCAACAAGCTGATACTACAAATCCCTTATATTAACAGGTAGTTTAAATGTGGAAATAAG\nGCAAGCATACTTGTTAGCACAATACTTCAGATATAATTGAGACNCCTGCTATNCATATTA\nGGTCNCGTTGTATACAAGCTCCATGGTGTGGGGTAATCCCATTNCCTATTTATTTATGGC\nNCACGNTACTTTAGNCCA\n`;
    await expect(enaFastaParseResult, expectedResult);
  });

  test('enaIdParseByQueryWorksCorrectly', async () => {
    // eslint-disable-next-line max-len
    const expectedResult = `ID   LR794596; SV 1; linear; genomic RNA; CON; VRL; 29706 BP.\nXX\nAC   LR794596;\nXX\nPR   Project:PRJEB37722;\nXX\nDT   11-SEP-2020 (Rel. 144, Created)\nDT   19-NOV-2020 (Rel. 144, Last updated, Version 2)\nXX\nDE   Severe acute respiratory syndrome coronavirus 2 isolate nasopharyngeal\nDE   genome assembly, scaffold: scaffold00001\nXX\nKW   .\nXX\nOS   Severe acute respiratory syndrome coronavirus 2\nOC   Viruses; Riboviria; Orthornavirae; Pisuviricota; Pisoniviricetes;\nOC   Nidovirales; Cornidovirineae; Coronaviridae; Orthocoronavirinae;\nOC   Betacoronavirus; Sarbecovirus.\nXX\nRN   [1]\nRG   IHU-MI Genome\nRA   ;\nRT   ;\nRL   Submitted (21-APR-2020) to the INSDC.\nRL   URMITE, IHU - Mediterranee Infection, 19-21 Boulevard Jean Moulin, 13005\nRL   Marseille, France\nXX\nDR   MD5; 72a7159a4439aa5481e40c0e51754075.\nDR   ENA; CADIOH010000000; SET.\nDR   ENA; CADIOH000000000; SET.\nDR   BioSample; SAMEA6660144.\nXX\nFH   Key             Location/Qualifiers\nFH\nFT   source          1..29706\nFT                   /organism="Severe acute respiratory syndrome coronavirus 2"\nFT                   /isolate="nasopharyngeal"\nFT                   /mol_type="genomic RNA"\nFT                   /db_xref="taxon:2697049"\nFT   assembly_gap    10435..10470\nFT                   /estimated_length=36\nFT                   /gap_type="within scaffold"\nFT                   /linkage_evidence="paired-ends"\nFT   assembly_gap    23622..23659\nFT                   /estimated_length=38\nFT                   /gap_type="within scaffold"\nFT                   /linkage_evidence="paired-ends"\nFT   assembly_gap    23777..23789\nFT                   /estimated_length=13\nFT                   /gap_type="within scaffold"\nFT                   /linkage_evidence="paired-ends"\nXX\nCO   join(CADIOH010000001.1:1..10434,gap(36),CADIOH010000002.1:1..13151,gap(38),\nCO   CADIOH010000003.1:1..117,gap(13),CADIOH010000004.1:1..5917)\n//\n`;
    await expect(enaIdParseByQueryResult, expectedResult);
  });

  test('enaSequenceFetchWorksCorrectly', async () => {
    const expectedResult = DG.DataFrame.fromCsv(
      `ID,Sequence
      LR794596,GGCTGCATGCTTAGTGCACTCACGCAGTATAA`);
    await expect(enaSequenceFetchResult.toCsv(), expectedResult.toCsv());
  });
});
