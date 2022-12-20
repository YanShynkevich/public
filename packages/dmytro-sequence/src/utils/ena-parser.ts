import * as grok from 'datagrok-api/grok';

export async function parseENA(cellText: string): Promise<string> {
  const url = `https://www.ebi.ac.uk/ena/browser/api/fasta/${cellText}`;
  const fasta = await (await grok.dapi.fetchProxy(url)).text();

  return fasta;
}
