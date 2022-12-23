import * as DG from 'datagrok-api/dg';
import * as grok from 'datagrok-api/grok';

//function for getting ENA information from files by search query and transforming it into dataframe
export async function _fetchENASequence(query: string, limit: number, offset: number, sequenceLength: number) {
  //get the ENA ids
  const output = await parseEnaIdByQuery(query, limit, offset);

  // if (output === '')
  //   return DG.DataFrame.fromCsv('');

  const regex = new RegExp('ID   [A-Z]{2}[0-9]{6}', 'g');
  const outputIdList = output.match(regex);

  const idList = Array<string>(outputIdList!.length);
  const sequenceList = Array<string>(outputIdList!.length);

  for (let i = 0; i < outputIdList!.length; i++) {
    //get last 8 elements - id of sequence
    idList[i] = outputIdList![i].slice(-8);

    //extracting ENA sequences
    const fasta = await parseFastaENA(idList[i]);
    const nucleotide = fasta.substring(fasta.indexOf('\n') + 1, fasta.length - (fasta.indexOf('\n') + 1) - 1);
    sequenceList[i] = nucleotide.slice(0, sequenceLength);
  }

  const df = DG.DataFrame.fromColumns([
    DG.Column.fromList(DG.COLUMN_TYPE.STRING, 'ID', idList),
    DG.Column.fromList(DG.COLUMN_TYPE.STRING, 'Sequence', sequenceList),
  ]);

  return df;
}

export async function parseFastaENA(cellText: string): Promise<string> {
  const url = `https://www.ebi.ac.uk/ena/browser/api/fasta/${cellText}`;
  //fasta - info about nucleotiode sequence and nucleotiode sequence itself
  const fasta = await (await grok.dapi.fetchProxy(url)).text();

  return fasta;
}

export async function parseEnaIdByQuery(query: string, limit: number, offset: number): Promise<string> {
  // eslint-disable-next-line max-len
  const url = `https://www.ebi.ac.uk/ena/browser/api/embl/textsearch?result=sequence&query=${query}&limit=${limit}&offset=${offset}`;
  const output = await (await grok.dapi.fetchProxy(url)).text();

  return output;
}
