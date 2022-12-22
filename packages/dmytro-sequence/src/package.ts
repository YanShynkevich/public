/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {DataFrame} from 'datagrok-api/dg';

import {getSubsequenceCountInColumn} from './utils/string-manipulation';
import {NucleotideBoxCellRenderer} from './utils/cell-renderer';
import {parseFastaENA, _fetchENASequence} from './utils/ena-parser';

export const _package = new DG.Package();
const packageName = 'DmytroSequence';

//function for info

//name: info
export function info() {
  grok.shell.info(_package.webRoot);
}

//function for nucleotide complement

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

  const regex = new RegExp('^[ACGTRNDacgtrnd\\s]+$');
  if (!nucleotides.match(regex)) return 'String is not a nucleotide.';

  return nucleotides.replace(/A|a|T|t|G|g|C|c/g, function(matched) {
    return complementDictionary[matched];
  });
}

//widget for nucleotide complement

//name: complementWidget
//tags: panel, widgets
//input: string nucleotides {semType: dna_nucleotide}
//output: widget result
//condition: true
export function complementWidget(nucleotides: string) {
  return new DG.Widget(ui.divText(complement(nucleotides)));
}

//function for database query

//name: getOrders
//output: dataframe df
export async function getOrders() {
  const queryName = 'ordersByCountry';
  return await grok.data.query(`${packageName}:${queryName}`, {country: 'USA'});
}

/*function for joining 2 dataframes and adding count of specific row subsequences of length N of first dataframe
  in all sequences of the second dataframe*/

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

//cell renderer of dna_nucleotide semantic type cells

//name: nucleotideBoxCellRenderer
//tags: cellRenderer
//meta.cellType: dna_nucleotide
//output: grid_cell_renderer result
export function nucleotideBoxCellRenderer() {
  return new NucleotideBoxCellRenderer();
}

//widget for ENA sequence of specific ENA id

//name: ENA Sequence
//tags: panel, widgets
//input: string cellText {semType: EnaID}
//output: widget result
//condition: true
export async function enaSequence(cellText: string): Promise<DG.Widget> {
  //get the ENA
  const fasta = await parseFastaENA(cellText);

  if (fasta.includes('error=Not Found'))
    return new DG.Widget(ui.divText(`ENA id ${cellText} not found.`));

  const headerText = fasta.substring(0, fasta.indexOf('\n'));
  const nucleotide = fasta.substring(fasta.indexOf('\n') + 1, fasta.length - (fasta.indexOf('\n') + 1) - 1);

  const header = ui.h3(headerText);
  const textArea = ui.textInput('', nucleotide).root;
  textArea.style.height = '260px';
  textArea.style.width = '245px';

  const element = ui.divV([header, textArea]);
  const widget = new DG.Widget(element);

  return widget;
}

//dialog function to see preview of query and then the full dataframe

//name: formENADataTable
//output: dataframe df
export async function formENADataTable() {
  let df = await _fetchENASequence('coronavirus', 10, 0, 60);
  const grid = DG.Viewer.grid(df);

  const queryInput = ui.stringInput('Query: ', 'coronavirus');
  const limitInput = ui.intInput('How many rows: ', 100);
  const offsetInput = ui.intInput('Nucleotides offset:', 0);
  const sequenceInput = ui.intInput('How many nucleotides:', 60);

  const button = ui.button('Search', async () => {
    df = await _fetchENASequence(queryInput.value, 10, offsetInput.value!, sequenceInput.value!);
    grid.dataFrame = df;
  });
  ui.dialog('Create sequences table')
    .add(ui.divV([
      ui.span([queryInput.root]),
      ui.div([limitInput]),
      ui.div([offsetInput]),
      ui.div([sequenceInput]),
      button,
      ui.div([grid]),
    ]))
    .onOK(async () => {
    // Display the resulting table
      df = await _fetchENASequence(queryInput.value, limitInput.value!, offsetInput.value!, sequenceInput.value!);
      console.log(df.toCsv());
      grok.shell.addTableView(df);
    })
    .show();
}
