/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {Column, DataFrame} from 'datagrok-api/dg';

export const _package = new DG.Package();
const packageName = 'DmytroSequence';

//name: info
export function info() {
  grok.shell.info(_package.webRoot);
}


//name: complement
//input: string nucleotides {semType: dna_nucleotide}
//output: string result {semType: dna_nucleotide}
export function complement(nucleotides: string): string {
  const complementDictionary: any = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G',
  };

  const regex = '^[ATGC]+$';
  if (!nucleotides.match(regex)) return 'String is not a nucleotide.';

  return nucleotides.replace(/A|T|G|C/g, function(matched) {
    return complementDictionary[matched];
  });
}

//name: complementWidget
//tags: panel, widgets
//input: string nucleotides {semType: dna_nucleotide}
//output: widget result
//condition: true
export function complementWidget(nucleotides: string) {
  return new DG.Widget(ui.divText(complement(nucleotides)));
}


//name: getOrders
//output: dataframe df
export async function getOrders() {
  const queryName = 'ordersByCountry';
  return await grok.data.query(`${packageName}:${queryName}`, {country: 'USA'});
}

//name: fuzzyJoin
//input: dataframe df1
//input: dataframe df2
//input: int N
export function fuzzyJoin(df1: DataFrame, df2: DataFrame, N: number) {
  // let col1 = df1.columns.bySemType('dna_nucleotide');
  // let col2 = df2.columns.bySemType('dna_nucleotide');
  let df = df1;
  df = df.append(df2);

  grok.shell.addTableView(df);
}
