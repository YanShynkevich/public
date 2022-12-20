/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {DataFrame} from 'datagrok-api/dg';

import {getSubsequenceCountInColumn} from './utils/string-manipulation';
import {NucleotideBoxCellRenderer} from './utils/cell-renderer';
import { parseENA } from './utils/ena-parser';

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
  const complementDictionary: {[letterToChange: string]: string} = {
    'A': 'T',
    'a': 't',
    'T': 'A',
    't': 'a',
    'G': 'C',
    'g': 'c',
    'C': 'G',
    'c': 'g',
  };

  const regex = new RegExp('^[ACGTacgt\\s]+$');
  if (!nucleotides.match(regex)) return 'String is not a nucleotide.';

  return nucleotides.replace(/A|a|T|t|G|g|C|c/g, function(matched) {
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
export function fuzzyJoin(df1: DataFrame, df2: DataFrame, N: number): DG.DataFrame {
  const col1 = df1.columns.bySemType('dna_nucleotide');
  const col2 = df2.columns.bySemType('dna_nucleotide');
  const df = df1.append(df2);

  const countList = [...getSubsequenceCountInColumn(col1!, col2!, N), ...getSubsequenceCountInColumn(col2!, col1!, N)];

  const column = DG.Column.fromList('int', 'Counts', countList);
  df.columns.add(column);

  grok.shell.addTableView(df);
  return df;
}

//name: nucleotideBoxCellRenderer
//tags: cellRenderer
//meta.cellType: dna_nucleotide
//output: grid_cell_renderer result
export function nucleotideBoxCellRenderer() {
  return new NucleotideBoxCellRenderer();
}

//name: ENA Sequence
//tags: panel, widgets
//input: string cellText {semType: EnaID}
//output: widget result
//condition: true
export async function enaSequence(cellText: string) {
  const fasta = await parseENA(cellText);

  if (fasta.includes('error=Not Found'))
    return new DG.Widget(ui.divText(`ENA id ${cellText} not found.`));

  let headerText = '';
  let nucleotide = '';
  for (let i = 0; i < fasta.length; i++) {
    if (fasta[i] === '\n') {
      headerText = fasta.substring(0, i);
      nucleotide = fasta.substring(i + 1, fasta.length);
      break;
    }
  }

  const header = ui.h3(headerText);
  const textArea = ui.textInput('', nucleotide).root;
  textArea.style.height = '260px';
  textArea.style.width = '245px';

  const element = ui.divV([header, textArea]);
  const widget = new DG.Widget(element);

  return widget;
}
