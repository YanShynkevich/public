import * as DG from 'datagrok-api/dg';

export class NucleotideBoxCellRenderer extends DG.GridCellRenderer {
  get name() {return 'Nucleotide cell renderer';}
  get cellType() {return 'dna_nucleotide';}

  render(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
    gridCell: DG.GridCell, cellStyle: DG.GridCellStyle) {
    //set canvas parameters
    g.font = '16px monospace';
    g.textBaseline = 'top';

    //paint the nucleotides
    const complementDictionary: {[letterToPaint: string]: string} = {
      'a': 'green',
      't': 'red',
      'g': 'black',
      'c': 'blue',
      'r': 'turquoise',
      'n': 'turquoise',
      'd': 'burgundy',
    };

    //"grid" parameteres of dna rendering in cell
    const rowsAmount = 4;
    const dy = 20;
    const xBegin = x;
    const xPadding = 5;
    const yPadding = 5;

    let i = 0;
    for (let n = 1; n <= rowsAmount; n++) {
      //Math.ceil() for getting the right amount of elements in a "row"
      for (; i < Math.ceil(gridCell.cell.value.length * (n / rowsAmount)); i++) {
        const ch = gridCell.cell.value.charAt(i);
        g.fillStyle = complementDictionary[ch.toLowerCase()];
        g.fillText(ch, x + xPadding, y + yPadding);
        x += g.measureText(ch).width;
      }
      y += dy;
      x = xBegin;
    }
  }
}
