/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export let _package = new DG.Package();

//name: Sequence Translator
//tags: app
export function sequenceTranslator(): void {

  let detectedSequenceSemType = ui.divText('');
  let output = ui.h1('Output (example)');
  let inp = ui.textInput("", "", (seq: string) => {
    let outputValues = convertSequence(seq.replace(/\s/g, ''));
    resultsGrid.set('Code', 0, 'Nucleotides');
    resultsGrid.set('Sequence', 0, outputValues.nucleotides);
    resultsGrid.set('Code', 1, 'BioSpring');
    resultsGrid.set('Sequence', 1, outputValues.bioSpring);
    resultsGrid.set('Code', 2, 'Axolabs');
    resultsGrid.set('Sequence', 2, outputValues.axolabs);
    resultsGrid.set('Code', 3, 'GCRS');
    resultsGrid.set('Sequence', 3, outputValues.gcrs);
    detectedSequenceSemType.textContent = 'Detected input type: ' + outputValues.type;
    output.textContent = 'Output';
    table.dataFrame = resultsGrid;
  });

  let inputContorls = ui.div([
    ui.h1('Input sequence'),
    ui.div([
      inp.root
    ],'input-base')
  ], 'sequenceInput');

  let resultsGrid = DG.DataFrame.fromColumns([
    DG.Column.string('Code', 4),
    DG.Column.string('Sequence', 4)
  ]);

  resultsGrid.set('Code', 0, 'Nucleotides');
  resultsGrid.set('Sequence', 0, 'UUCAACUGCUUACGUCUUU');
  resultsGrid.set('Code', 1, 'BioSpring');
  resultsGrid.set('Sequence', 1, '5\*1\*766354715274575\*5\*5');
  resultsGrid.set('Code', 2, 'Axolabs');
  resultsGrid.set('Sequence', 2, 'usUfscaaCfuGfcUfuAfcGfucususu');
  resultsGrid.set('Code', 3, 'GCRS');
  resultsGrid.set('Sequence', 3, 'mUpsfUpsmCmAmAfCmUfGmCfUmUfAmCfGmUmCmUpsmUpsmU');

  let table = DG.Viewer.grid(resultsGrid);
  // @ts-ignore
  table.columns.byName('Code').width = 80;
  // @ts-ignore
  table.columns.byName('Sequence').width = 850;

  let appDescription = ui.div([
    ui.h1('Convert oligonucleotide sequences between Nucleotides, BioSpring, Axolabs, and GCRS representations.'),
    ui.divText('\n How to convert one sequence:',{style:{'font-weight':'bolder'}}),
    ui.divText("Paste sequence into the text field below"),
    ui.divText('\n How to convert many sequences:',{style:{'font-weight':'bolder'}}),
    ui.divText("1. Drag & drop an Excel or CSV file with sequences into Datagrok. The platform will automatically detect columns with sequences"),
    ui.divText('2. Right-click on the column header, then see the \'Convert\' menu'),
    ui.divText("This will add the result column to the right of the table"),
  ], 'grok-datajob-publish-alert');

  const codes1 = DG.Viewer.grid(DG.DataFrame.fromCsv(
    'For ASO Gapmers\tBioSpring\tAxolabs\tGCRS\n' +
    '2\'MOE-5Me-rU\t5\t\tmoeT\n' +
    '2\'MOE-rA\t6\t\tmoeA\n' +
    '2\'MOE-5Me-rC\t7\t\tmoe5mC\n' +
    '2\'MOE-rG\t8\t\tmoeG\n' +
    '5-Methyl-dC\t9\t\t5mC\n' +
    'ps linkage\t*\t\tps\n' +
    'dA\tA\t\tA\n' +
    'dC\tC\t\tC\n' +
    'dG\tG\t\tG\n' +
    'dT\tT\t\tT\n'));
  const codes2 = DG.Viewer.grid(DG.DataFrame.fromCsv(
    'For 2\'-OMe and 2\'-F modified siRNA\tBioSpring\tAxolabs\tGCRS\n' +
    '2\'-fluoro-U\t1\tUf\tfU\n' +
    '2\'-fluoro-A\t2\tAf\tfA\n' +
    '2\'-fluoro-C\t3\tCf\tfC\n' +
    '2\'-fluoro-G\t4\tGf\tfG\n' +
    '2\'OMe-rU\t5\tu\tmU\n' +
    '2\'OMe-rA\t6\ta\tmA\n' +
    '2\'OMe-rC\t7\tc\tmC\n' +
    '2\'OMe-rG\t8\tg\tmG\n' +
    'ps linkage\t*\ts\tps\n'));
  // @ts-ignore
  codes2.columns.byName('For 2\'-OMe and 2\'-F modified siRNA').width = 213;
  // @ts-ignore
  codes2.columns.byName('BioSpring').width = 68;
  // @ts-ignore
  codes2.columns.byName('Axolabs').width = 55;
  // @ts-ignore
  codes2.columns.byName('GCRS').width = 40;
  let acc = ui.accordion();
  acc.addPane('CMO Codes', () => ui.div([codes1.root, codes2.root]), false);

  let view = grok.shell.newView('Sequence Translator', []);
  view.append(
    ui.divV([
      appDescription,
      ui.divV([
        inputContorls,
        detectedSequenceSemType,
        ui.block([
          output,
          ui.div([table.root], 'table')
        ]),
        acc.root
      ], 'sequence')
    ])
  );

  $('.table .d4-grid')
    .css('height','150px')
    .css('width','100%');
  $('.sequence')
    .css('padding','20px 0')
    .children().css('padding','5px 0');
  $('.sequenceInput .input-base').css('margin','0');
  $('.sequenceInput textarea')
    .attr('placeholder','Paste here')
    .css('resize','none')
    .css('min-height','50px')
    .css('width','100%');
  $('.sequenceInput select')
    .css('width','100%')
    .attr('placeholder','');
}

export function isNucleotidesCode(sequence: string): boolean {return /^[ATGCU]{10,}$/.test(sequence);}

export function isAsoGapmerBioSpringCode(sequence: string): boolean {return /^[*56789ATGC]{30,}$/.test(sequence);}

export function isAsoGapmerGcrsCode(sequence: string): boolean {return /^(?=.*moe)(?=.*5mC)(?=.*ps){30,}/.test(sequence);}

export function isSiRnaBioSpringCode(sequence: string): boolean {return /^[*1-8]{30,}$/.test(sequence);}

export function isSiRnaAxolabsCode(sequence: string): boolean {return /^[fsACGUacgu]{30,}$/.test(sequence);}

export function isSiRnaGcrsCode(sequence: string): boolean {return /^[fmpsACGU]{30,}$/.test(sequence);}

function convertSequence(seq: string) {
  if (isNucleotidesCode(seq))
    return {
      type: "Nucleotides Code",
      nucleotides: seq,
      bioSpring: asoGapmersNucleotidesToBioSpring(seq),
      axolabs: "No translation table available",
      gcrs: asoGapmersNucleotidesToGcrs(seq)
  };
  if (isAsoGapmerBioSpringCode(seq))
    return {
      type: "ASO Gapmers / BioSpring Code",
      nucleotides: asoGapmersBioSpringToNucleotides(seq),
      bioSpring: seq,
      axolabs: "No translation table available",
      gcrs: asoGapmersBioSpringToGcrs(seq)
    };
  if (isAsoGapmerGcrsCode(seq))
    return {
      type: "ASO Gapmers / GCRS Code",
      nucleotides: asoGapmersGcrsToNucleotides(seq),
      bioSpring: asoGapmersGcrsToBioSpring(seq),
      axolabs: "No translation table available",
      gcrs: seq
    };
  if (isSiRnaBioSpringCode(seq))
    return {
      type: "siRNA / bioSpring Code",
      nucleotides: siRnaBioSpringToNucleotides(seq),
      bioSpring: seq,
      axolabs: siRnaBioSpringToAxolabs(seq),
      gcrs: siRnaBioSpringToGcrs(seq)
    };
  if (isSiRnaAxolabsCode(seq))
    return {
      type: "siRNA / Axolabs Code",
      nucleotides: siRnaAxolabsToNucleotides(seq),
      bioSpring: siRnaAxolabsToBioSpring(seq),
      axolabs: seq,
      gcrs: siRnaAxolabsToGcrs(seq)
    };
  if (isSiRnaGcrsCode(seq))
    return {
      type: "siRNA / GCRS Code",
      nucleotides: siRnaGcrsToNucleotides(seq),
      bioSpring: siRnaGcrsToBioSpring(seq),
      axolabs: siRnaGcrsToAxolabs(seq),
      gcrs: seq
    };
  return {
    type: "Type of input sequence is undefined",
    nucleotides: "Type of input sequence is undefined",
    bioSpring: "Type of input sequence is undefined",
    axolabs: "Type of input sequence is undefined",
    gcrs: "Type of input sequence is undefined"
  };
}

//name: asoGapmersNucleotidesToBioSpring
//input: string nucleotides {semType: nucleotides}
//output: string result {semType: BioSpring / Gapmers}
export function asoGapmersNucleotidesToBioSpring(nucleotides: string) {
  let count: number = -1;
  const objForEdges: {[index: string]: string} = {"T": "5*", "A": "6*", "C": "7*", "G": "8*"};
  const objForCenter: {[index: string]: string} = {"C": "9*", "A": "A*", "T": "T*", "G": "G*"};
  return nucleotides.replace(/[ATCG]/g, function (x: string) {
    count++;
    if (count < 5) return objForEdges[x];
    if (count < 15) return objForCenter[x];
    return objForEdges[x];
  }).slice(0, 2 * count + 1);
}

//name: asoGapmersNucleotidesToGcrs
//input: string nucleotides {semType: nucleotides}
//output: string result {semType: GCRS / Gapmers}
export function asoGapmersNucleotidesToGcrs(nucleotides: string) {
  let count: number = -1;
  const objForEdges: {[index: string]: string} = {"T": "moeUnps", "A": "moeAnps", "C": "moe5mCnps", "G": "moeGnps"};
  const objForCenter: {[index: string]: string} = {"C": "Cps", "A": "Aps", "T": "Tps", "G": "Gps"};
  return nucleotides.replace(/[ATCG]/g, function (x: string) {
    count++;
    if (count < 5) return objForEdges[x];
    if (count < 15) return objForCenter[x];
    return objForEdges[x];
  }).slice(0, -3);
}

//name: asoGapmersBioSpringToNucleotides
//input: string nucleotides {semType: BioSpring / Gapmers}
//output: string result {semType: nucleotides}
export function asoGapmersBioSpringToNucleotides(nucleotides: string) {
  const obj: {[index: string]: string} = {"*": "", "5": "T", "6": "A", "7": "C", "8": "G", "9": "C"};
  return nucleotides.replace(/[*56789]/g, function (x: string) {return obj[x];});
}

//name: asoGapmersBioSpringToGcrs
//input: string nucleotides {semType: BioSpring / Gapmers}
//output: string result {semType: GCRS / Gapmers}
export function asoGapmersBioSpringToGcrs(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "5*": "moeUnps", "6*": "moeAnps", "7*": "moe5mCnps", "8*": "moeGnps", "9*": "5mCps", "A*": "Aps", "T*": "Tps",
    "G*": "Gps", "C*": "Cps", "5": "moeU", "6": "moeA", "7": "moe5mC", "8": "moeG"
  };
  return nucleotides.replace(/(5\*|6\*|7\*|8\*|9\*|A\*|T\*|G\*|C\*|5|6|7|8])/g, function (x: string) {return obj[x];});
}

//name: asoGapmersGcrsToBioSpring
//input: string nucleotides {semType: GCRS / Gapmers}
//output: string result {semType: BioSpring / Gapmers}
export function asoGapmersGcrsToBioSpring(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "moeT": "5", "moeA": "6", "moe5mC": "7", "moeG": "8", "moeU": "5", "5mC": "9", "nps": "*", "ps": "*", "U": "T"
  };
  return nucleotides.replace(/(moeT|moeA|moe5mC|moeG|moeU|5mC|nps|ps|U)/g, function (x: string) {return obj[x];});
}

//name: asoGapmersGcrsToNucleotides
//input: string nucleotides {semType: GCRS / Gapmers}
//output: string result {semType: nucleotides}
export function asoGapmersGcrsToNucleotides(nucleotides: string) {
  const obj: {[index: string]: string} = {"moe": "", "5m": "", "n": "", "ps": "", "U": "T"};
  return nucleotides.replace(/(moe|5m|n|ps|U)/g, function (x: string) {return obj[x];});
}

//name: siRnaBioSpringToNucleotides
//input: string nucleotides {semType: BioSpring / siRNA}
//output: string result {semType: nucleotides}
export function siRnaBioSpringToNucleotides(nucleotides: string) {
  const obj: {[index: string]: string} = {"1": "U", "2": "A", "3": "C", "4": "G", "5": "U", "6": "A", "7": "C", "8": "G", "*": ""};
  return nucleotides.replace(/[12345678*]/g, function (x: string) {return obj[x];});
}

//name: siRnaBioSpringToAxolabs
//input: string nucleotides {semType: BioSpring / siRNA}
//output: string result {semType: Axolabs / siRNA}
export function siRnaBioSpringToAxolabs(nucleotides: string) {
  const obj: {[index: string]: string} = {"1": "Uf", "2": "Af", "3": "Cf", "4": "Gf", "5": "u", "6": "a", "7": "c", "8": "g", "*": "s"};
  return nucleotides.replace(/[12345678*]/g, function (x: string) {return obj[x];});
}

//name: siRnaBioSpringToGcrs
//input: string nucleotides {semType: BioSpring / siRNA}
//output: string result {semType: GCRS / siRNA}
export function siRnaBioSpringToGcrs(nucleotides: string) {
  const obj: {[index: string]: string} = {"1": "fU", "2": "fA", "3": "fC", "4": "fG", "5": "mU", "6": "mA", "7": "mC", "8": "mG", "*": "ps"};
  return nucleotides.replace(/[12345678*]/g, function (x: string) {return obj[x];});
}

//name: siRnaAxolabsToGcrs
//input: string nucleotides {semType: Axolabs / siRNA}
//output: string result {semType: GCRS / siRNA}
export function siRnaAxolabsToGcrs(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "Uf": "fU", "Af": "fA", "Cf": "fC", "Gf": "fG", "u": "mU", "a": "mA", "c": "mC", "g": "mG", "s": "ps"
  };
  return nucleotides.replace(/(Uf|Af|Cf|Gf|u|a|c|g|s)/g, function (x: string) {return obj[x];});
}

//name: siRnaAxolabsToBioSpring
//input: string nucleotides {semType: Axolabs / siRNA}
//output: string result {semType: BioSpring / siRNA}
export function siRnaAxolabsToBioSpring(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "Uf": "1", "Af": "2", "Cf": "3", "Gf": "4", "u": "5", "a": "6", "c": "7", "g": "8", "s": "*"
  };
  return nucleotides.replace(/(Uf|Af|Cf|Gf|u|a|c|g|s)/g, function (x: string) {return obj[x];});
}

//name: siRnaAxolabsToNucleotides
//input: string nucleotides {semType: Axolabs / siRNA}
//output: string result {semType: nucleotides}
export function siRnaAxolabsToNucleotides(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "Uf": "U", "Af": "A", "Cf": "C", "Gf": "G", "u": "U", "a": "A", "c": "C", "g": "G", "s": ""
  };
  return nucleotides.replace(/(Uf|Af|Cf|Gf|u|a|c|g|s)/g, function (x: string) {return obj[x];});
}

//name: siRnaGcrsToNucleotides
//input: string nucleotides {semType: GCRS / siRNA}
//output: string result {semType: nucleotides}
export function siRnaGcrsToNucleotides(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "fU": "U", "fA": "A", "fC": "C", "fG": "G", "mU": "U", "mA": "A", "mC": "C", "mG": "G", "ps": ""
  };
  return nucleotides.replace(/(Uf|Af|Cf|Gf|u|a|c|g|s)/g, function (x: string) {return obj[x];});
}

//name: siRnaGcrsToBioSpring
//input: string nucleotides {semType: GCRS / siRNA}
//output: string result {semType: BioSpring / siRNA}
export function siRnaGcrsToBioSpring(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "fU": "1", "fA": "2", "fC": "3", "fG": "4", "mU": "5", "mA": "6", "mC": "7", "mG": "8", "ps": "*"
  };
  return nucleotides.replace(/(fU|fA|fC|fG|mU|mA|mC|mG|ps)/g, function (x: string) {return obj[x];});
}

//name: siRnaGcrsToAxolabs
//input: string nucleotides {semType: GCRS / siRNA}
//output: string result {semType: Axolabs / siRNA}
export function siRnaGcrsToAxolabs(nucleotides: string) {
  const obj: {[index: string]: string} = {
    "fU": "Uf", "fA": "Af", "fC": "Cf", "fG": "Gf", "mU": "u", "mA": "a", "mC": "c", "mG": "g", "ps": "s"
  };
  return nucleotides.replace(/(fU|fA|fC|fG|mU|mA|mC|mG|ps)/g, function (x: string) {return obj[x];});
}