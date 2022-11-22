import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import * as bio from '@datagrok-libraries/bio';

import {after, before, category, test, expect, expectObject} from '@datagrok-libraries/utils/src/test';

category('bio', () => {
  const csvDfN1: string = `seq
ACGTCT
CAGTGT
TTCAAC
`;

  /** 2 - is an error monomer
   * This sequence set should be classified as nucleotides sequences.
   * Small error, not similar to amino acids.
   */
  const csvDfN1e: string = `seq
ACGTAT
CAGTTG
TTCG2C
`;

  /** Pure amino acids sequence */
  const csvDfAA1: string = `seq
FWPHEYV
YNRQWYV
MKPSEYV
`;

  /** A - alanine, G - glycine, T -= threonine, C - cysteine, W - tryptophan
   * This sequence set should be detected as amino acids more than nucleotides.
   */
  const csvDfAA2: string = `seq
AGTCAT
AGTCGC
AGTCATW
`;

  /** This sequence set should be recognized as unknown. */
  const csvDfX: string = `seq
XZJ{}2
5Z4733
3Z6></
675687
`;

  // anonymous functions specified in test() registering must return Promise<any>
  test('testGetStatsHelm1', async () => {
    const csv = `seq
PEPTIDE1{meI}$$$$
`;
    const df: DG.DataFrame = DG.DataFrame.fromCsv(csv);
    const seqCol: DG.Column = df.getCol('seq')!;
    const stats = bio.getStats(seqCol, 1, bio.splitterAsHelm);

    expectObject(stats.freq, {
      'meI': 1
    });
    expect(stats.sameLength, true);
  });

  test('testGetStatsN1', async () => { await _testGetStats(csvDfN1); });
  test('testGetAlphabetSimilarity', async () => { await _testGetAlphabetSimilarity(); });

  test('testPickupPaletteN1', async () => { await _testPickupPaletteN1(csvDfN1); });
  test('testPickupPaletteN1e', async () => { await _testPickupPaletteN1e(csvDfN1e); });
  test('testPickupPaletteAA1', async () => { await _testPickupPaletteAA1(csvDfAA1); });
  test('testPickupPaletteX', async () => { await _testPickupPaletteX(csvDfX); });
});

category('WebLogo.monomerToShort', () => {
  test('longMonomerSingle', async () => {
    await expect(bio.monomerToShort('S', 5), 'S');
  });
  test('longMonomerShort', async () => {
    await expect(bio.monomerToShort('Short', 5), 'Short');
  });
  test('longMonomerLong56', async () => {
    await expect(bio.monomerToShort('Long56', 5), 'Long5…');
  });
  test('longMonomerComplexFirstPartShort', async () => {
    await expect(bio.monomerToShort('Long-long', 5), 'Long…');
  });
  test('longMonomerComplexFirstPartLong56', async () => {
    await expect(bio.monomerToShort('Long56-long', 5), 'Long5…');
  });
});


export async function _testGetStats(csvDfN1: string) {
  const dfN1: DG.DataFrame = DG.DataFrame.fromCsv(csvDfN1);
  const seqCol: DG.Column = dfN1.col('seq')!;
  const stats = bio.getStats(seqCol, 5, bio.splitterAsFasta);

  expectObject(stats.freq, {
    'A': 4,
    'C': 5,
    'G': 3,
    'T': 6
  });
  expect(stats.sameLength, true);
}

export async function _testGetAlphabetSimilarity() {
  const freq: { [m: string]: number } = {
    'A': 2041,
    'C': 3015,
    'G': 3015,
    'T': 2048,
    '-': 1000
  };
  const alphabet: Set<string> = new Set(Object.keys(bio.Nucleotides.Names));
  const res = bio.getAlphabetSimilarity(freq, alphabet);

  expect(res > 0.6, true);
}

export async function _testPickupPaletteN1(csvDfN1: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfN1);
  const col: DG.Column = df.col('seq')!;
  const cp = bio.pickUpPalette(col);

  expect(cp instanceof bio.NucleotidesPalettes, true);
}

export async function _testPickupPaletteN1e(csvDfN1e: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfN1e);
  const col: DG.Column = df.col('seq')!;
  const cp = bio.pickUpPalette(col);

  expect(cp instanceof bio.NucleotidesPalettes, true);
}

export async function _testPickupPaletteAA1(csvDfAA1: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfAA1);
  const col: DG.Column = df.col('seq')!;
  const cp = bio.pickUpPalette(col);

  expect(cp instanceof bio.AminoacidsPalettes, true);
}

export async function _testPickupPaletteX(csvDfX: string) {
  const df: DG.DataFrame = DG.DataFrame.fromCsv(csvDfX);
  const col: DG.Column = df.col('seq')!;
  const cp = bio.pickUpPalette(col);

  expect(cp instanceof bio.UnknownSeqPalette, true);
}

export async function _testPickupPaletteAA2(dfAA2: DG.DataFrame) {
  const seqCol: DG.Column = dfAA2.col('seq')!;
  const cp = bio.pickUpPalette(seqCol);

  expect(cp instanceof bio.AminoacidsPalettes, true);
}
