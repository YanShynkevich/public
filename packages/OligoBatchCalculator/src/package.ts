import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import $ from 'cash-dom';
import {weightsObj, individualBases, nearestNeighbour, SYNTHESIZERS, CURRENT_USER, STORAGE_NAME,
  ADDITIONAL_MODS_COL_NAMES, MAIN_COL_NAMES, BASE_MODIFICATIONS, UNITS} from './constants';
import {validate} from './validation';
import {deleteWord, saveAsCsv, sortByStringLengthInDescOrder, mergeOptions, normalizeSequence,
  isCurrentUserAppAdmin, stringify} from './helpers';
import {addModificationButton, deleteAdditionalModification} from './additional-modifications';

export const _package = new DG.Package();


const additionalWeightsObj: {[index: string]: number} = {};
const extinctionCoeffsObj: {[index: string]: number} = {};
const additionalModificationsDf = DG.DataFrame.fromColumns(
  Object.values(ADDITIONAL_MODS_COL_NAMES).map((name) => DG.Column.fromStrings(name, [])),
);
const additionalAbbreviations: string[] = [];
(async () => {
  const modifications: any[] = [];
  const entries = await grok.dapi.userDataStorage.get(STORAGE_NAME, CURRENT_USER);
  if (entries != null && Object.keys(entries).length == 0)
    grok.shell.info('Storage is empty. Try to post something to the storage');
  else {
    const invalidKeys = [
      'baseModification', 'extinctionCoefficient', 'molecularWeight', 'abbreviation', 'longName', 'changeLogs',
    ];
    for (const key of Object.keys(entries)) {
      if (!invalidKeys.includes(key))
        modifications.push(JSON.parse(entries[key]));
    }
  }
  const molWeightList = modifications.map((e) => (e.molecularWeight == undefined) ? 0 : e.molecularWeight);
  const extinctionCoefList = modifications.map((e) => String(e.extinctionCoefficient));

  const additionalModsDf = DG.DataFrame.fromColumns([
    DG.Column.fromStrings(ADDITIONAL_MODS_COL_NAMES.LONG_NAMES, modifications.map((e) => e.longName)),
    DG.Column.fromStrings(ADDITIONAL_MODS_COL_NAMES.ABBREVIATION, modifications.map((e) => e.abbreviation)), // @ts-ignore
    DG.Column.fromFloat32Array(ADDITIONAL_MODS_COL_NAMES.MOLECULAR_WEIGHT, molWeightList),
    DG.Column.fromStrings(ADDITIONAL_MODS_COL_NAMES.BASE_MODIFICATION, modifications.map((e) => e.baseModification)),
    DG.Column.fromStrings(ADDITIONAL_MODS_COL_NAMES.EXTINCTION_COEFFICIENT, extinctionCoefList),
    DG.Column.fromStrings(ADDITIONAL_MODS_COL_NAMES.ACTION, Array(modifications.length)),
    DG.Column.fromStrings(ADDITIONAL_MODS_COL_NAMES.CHANGE_LOGS, modifications.map((e) => e.changeLogs)),
  ])!;
  let additionalAbbreviations = additionalModsDf.getCol(ADDITIONAL_MODS_COL_NAMES.ABBREVIATION).toList();
  let additionalWeights = additionalModsDf.getCol(ADDITIONAL_MODS_COL_NAMES.MOLECULAR_WEIGHT).toList();
  const extinctionCoefficients = additionalModsDf.getCol(ADDITIONAL_MODS_COL_NAMES.EXTINCTION_COEFFICIENT).toList();
  additionalAbbreviations.forEach((key, i) => {
    additionalWeightsObj[key] = additionalWeights[i];
    if (extinctionCoefficients[i] != 'Base')
      extinctionCoeffsObj[key] = extinctionCoefficients[i] ?? 1;
  });
})();

//name: getUnits
//output: list<string> units
export function getUnits(): string[] {
  return Object.values(UNITS);
}

//name: opticalDensity
//input: string sequence
//input: double amount
//input: string outputUnits {choices: OligoBatchCalculator: getUnits}
//output: double opticalDensity
export async function opticalDensity(sequence: string, amount: number, outputUnits: string,
  extCoefsObj: {[index: string]: number}): Promise<number> {
  const ec = await extinctionCoefficient(sequence, extCoefsObj);
  if (outputUnits == UNITS.MILLI_GRAM && outputUnits == UNITS.MICRO_GRAM)
    return (outputUnits == UNITS.MICRO_GRAM ? 1 : 0.001) * amount * ec / molecularWeight(sequence);
  if (outputUnits == UNITS.OPTICAL_DENSITY)
    return amount;
  const coefficient = (outputUnits == UNITS.NANO_MOLE) ? 1000000 : (outputUnits == UNITS.MILLI_GRAM) ? 1 : 1000;
  return amount * ec / coefficient;
}

//name: nMole
//input: string sequence
//input: double amount
//input: string outputUnits {choices: OligoBatchCalculator: getUnits}
//output: double nMole
export async function nMole(sequence: string, amount: number, outputUnits: string, extinctionCoefficientsObj:
  {[index: string]: number}, weightsObj: {[index: string]: number}): Promise<number> {
  const ec = await extinctionCoefficient(sequence, extinctionCoefficientsObj);
  return (outputUnits == UNITS.OPTICAL_DENSITY) ?
    1000000 * amount / ec :
    1000 * amount / molecularWeight(sequence, weightsObj);
}

//name: molecularMass
//input: string sequence
//input: double amount
//input: string outputUnits {choices: OligoBatchCalculator: getUnits}
//output: double molecularMass
export async function molecularMass(sequence: string, amount: number, outputUnits: string): Promise<number> {
  const ec = await extinctionCoefficient(sequence, extinctionCoeffsObj);
  const od = await opticalDensity(sequence, amount, outputUnits, extinctionCoeffsObj);
  const nm = await nMole(sequence, amount, outputUnits, extinctionCoeffsObj, additionalWeightsObj);
  if (outputUnits == UNITS.OPTICAL_DENSITY) {
    return (ec == 0) ?
      amount * molecularWeight(sequence, additionalWeightsObj) :
      1000 * amount * molecularWeight(sequence, additionalWeightsObj) / ec;
  }
  const coefficient = (outputUnits == UNITS.MILLI_GRAM) ? 1 : 1000;
  return amount / ec * molecularWeight(sequence) * coefficient * od / nm;
}

//name: molecularWeight
//input: string sequence
//input: string additionalWeightsObj
//output: double molWeight
export function molecularWeight(sequence: string, additionalWeightsObj?: {[index: string]: number}): number {
  const codes = (additionalWeightsObj == null) ?
    sortByStringLengthInDescOrder(Object.keys(weightsObj)) :
    sortByStringLengthInDescOrder(Object.keys(weightsObj).concat(Object.keys(additionalWeightsObj)));
  const obj = (additionalWeightsObj != null) ? mergeOptions(weightsObj, additionalWeightsObj) : weightsObj;
  let weight = 0;
  let i = 0;
  while (i < sequence.length) {
    const matchedCode = codes.find((s) => s == sequence.slice(i, i + s.length))!;
    weight += obj[sequence.slice(i, i + matchedCode.length)];
    i += matchedCode!.length;
  }
  return weight - 61.97;
}

export async function extinctionCoefficient(sequence: string, extCoefsObj?: {[i: string]: number}): Promise<number> {
  let ns = normalizeSequence(sequence, SYNTHESIZERS.GCRS, null, additionalModificationsDf);
  let nearestNeighbourSum = 0;
  let individualBasisSum = 0;
  let modificationsSum = 0;
  if (extCoefsObj != null) {
    for (const modif of Object.keys(extCoefsObj)) {//@ts-ignore
      if (//@ts-ignore
        extCoefsObj[modif] != 'Base' &&
        extCoefsObj[modif] != undefined &&//@ts-ignore
        !isNaN(parseFloat(extCoefsObj[modif]))
      ) {//@ts-ignore
        modificationsSum += (sequence.match(new RegExp(modif, 'g')) || []).length * parseFloat(extCoefsObj[modif]);
        ns = deleteWord(ns, modif);
      }
    }
  }
  for (let i = 0; i < ns.length - 2; i += 2) {
    nearestNeighbourSum += (ns[i] == ns[i + 2]) ?
      nearestNeighbour[ns.slice(i, i + 2)][ns.slice(i + 2, i + 4)] :
      (
        nearestNeighbour['r' + ((ns[i + 1] == 'T') ? 'U' : ns[i + 1])]['r' + ((ns[i + 3] == 'T') ? 'U' : ns[i + 3])] +
        nearestNeighbour['d' + ((ns[i + 1] == 'U') ? 'T' : ns[i + 1])]['d' + ((ns[i + 3] == 'U') ? 'T' : ns[i + 3])]
      ) / 2;
  }
  for (let i = 2; i < ns.length - 2; i += 2)
    individualBasisSum += individualBases[ns.slice(i, i + 2)];
  return nearestNeighbourSum - individualBasisSum + modificationsSum;
}

//name: Oligo Batch Calculator
//tags: app
export async function OligoBatchCalculatorApp(): Promise<void> {
  const mainGrid = DG.Viewer.grid(DG.DataFrame.create(), {
    showRowHeader: false,
    showCellTooltip: true,
  });

  async function render(text: string): Promise<void> {
    const sequences = text.split('\n')
      .map((s) => s.replace(/\s/g, ''))
      .filter((item) => item);

    const indicesOfFirstNotValidCharacter = Array(sequences.length);
    const normalizedSequences = Array(sequences.length);
    const molecularWeights = new Float32Array(sequences.length);
    const extinctionCoefficients = new Float32Array(sequences.length);
    const nMoles = new Float32Array(sequences.length);
    const opticalDensities = new Float32Array(sequences.length);
    const molecularMasses = new Float32Array(sequences.length);
    const reasonsOfError = Array(sequences.length);

    for (const [i, sequence] of sequences.entries()) {
      indicesOfFirstNotValidCharacter[i] = validate(sequence, additionalAbbreviations);
      if (indicesOfFirstNotValidCharacter[i] < 0) {
        normalizedSequences[i] = normalizeSequence(sequence, SYNTHESIZERS.GCRS, null, additionalModificationsDf);
        if (normalizedSequences[i].length > 2) {
          try {
            molecularWeights[i] = molecularWeight(sequence, additionalWeightsObj);
            extinctionCoefficients[i] = await extinctionCoefficient(normalizedSequences[i], extinctionCoeffsObj);
            nMoles[i] = await nMole(sequence, yieldAmount.value!, units.value!, extinctionCoeffsObj,
              additionalWeightsObj);
            opticalDensities[i] = await opticalDensity(sequence, yieldAmount.value!, units.value!, extinctionCoeffsObj);
            molecularMasses[i] = await molecularMass(sequence, yieldAmount.value!, units.value!);
          } catch (e) {
            reasonsOfError[i] = 'Unknown error, please report it to Datagrok team';
            indicesOfFirstNotValidCharacter[i] = 0;
            grok.shell.error(String(e));
          }
        } else {
          reasonsOfError[i] = 'Sequence should contain at least two nucleotides';
          indicesOfFirstNotValidCharacter[i] = 0;
        }
      // }
      // else if (output.synthesizer == null)
      // reasonsOfError[i] = 'Not valid input';
      } else {
        reasonsOfError[i] = 'Sequence is expected to be in synthesizer \'' + SYNTHESIZERS.GCRS +
          '\', please see table below to see list of valid codes';
      }
    };

    const moleColumnName = (units.value == UNITS.MICRO_MOLE || units.value == UNITS.MILLI_GRAM) ?
      UNITS.MICRO_MOLE : UNITS.NANO_MOLE;
    const moleName2 = (units.value == UNITS.MICRO_MOLE) ? UNITS.MICRO_MOLE : UNITS.NANO_MOLE;
    const massName = (units.value == UNITS.MICRO_MOLE) ?
      UNITS.MILLI_GRAM :
      (units.value == UNITS.MILLI_GRAM) ?
        units.value :
        UNITS.MICRO_GRAM;
    const c = (units.value == UNITS.MILLI_GRAM || units.value == UNITS.MICRO_MOLE) ? 1000 : 1;

    mainGrid.dataFrame = DG.DataFrame.fromColumns([
      DG.Column.fromList(DG.COLUMN_TYPE.INT, MAIN_COL_NAMES.ITEM, Array(...Array(sequences.length + 1).keys()).slice(1)),
      DG.Column.fromStrings(MAIN_COL_NAMES.SEQUENCE, sequences),
      DG.Column.fromList(DG.COLUMN_TYPE.INT, MAIN_COL_NAMES.LENGTH, normalizedSequences.map((s) => s.length / 2)),
      DG.Column.fromFloat32Array(MAIN_COL_NAMES.OPTICAL_DENSITY, opticalDensities),
      DG.Column.fromFloat32Array(moleColumnName, nMoles),
      DG.Column.fromFloat32Array(`Mass [${massName}]`, molecularMasses),
      DG.Column.fromFloat32Array(`${moleName2}/OD`, nMoles.map(function(n, i) {return c * n / opticalDensities[i];})),
      DG.Column.fromFloat32Array(MAIN_COL_NAMES.MASS_OD_RATIO, molecularMasses.map(function(n, i) {return c * n / opticalDensities[i];})),
      DG.Column.fromFloat32Array(MAIN_COL_NAMES.MOLECULAR_WEIGHT, molecularWeights),
      DG.Column.fromFloat32Array(MAIN_COL_NAMES.EXTINCTION_COEFFICIENT, extinctionCoefficients),
    ]);

    const col = mainGrid.col(MAIN_COL_NAMES.SEQUENCE)!;
    col.cellType = 'html';
    mainGrid.onCellPrepare(function(gc) {
      if (gc.isTableCell && gc.gridColumn.name == MAIN_COL_NAMES.SEQUENCE) {
        const items = (indicesOfFirstNotValidCharacter[gc.gridRow] < 0) ?
          [ui.divText(gc.cell.value, {style: {color: 'grey'}})] :
          [
            ui.divText(gc.cell.value.slice(0, indicesOfFirstNotValidCharacter[gc.gridRow]), {style: {color: 'grey'}}),
            ui.tooltip.bind(
              ui.divText(gc.cell.value.slice(indicesOfFirstNotValidCharacter[gc.gridRow]), {style: {color: 'red'}}),
              reasonsOfError[gc.gridRow],
            ),
          ];
        gc.style.element = ui.divH(items, {style: {margin: '6px 0 0 6px'}});
      }
    });
  }

  const windows = grok.shell.windows;
  windows.showProperties = false;
  windows.showToolbox = false;
  windows.showHelp = false;

  const defaultInput = 'fAmCmGmAmCpsmU\nmApsmApsfGmAmUmCfGfAfC\nmAmUfGmGmUmCmAfAmGmA';

  const inputSequences = ui.textInput('', defaultInput, (txt: string) => render(txt));
  const yieldAmount = ui.floatInput('', 1, () => render(inputSequences.value));
  const units = ui.choiceInput('', UNITS.OPTICAL_DENSITY, Object.values(UNITS), () => render(inputSequences.value))!;

  await render(defaultInput);

  const downloadIcon = ui.iconFA('download', () => saveAsCsv(mainGrid.dataFrame), 'Save as CSV');
  $(downloadIcon).css('margin-left', '5px');

  const title = ui.panel([
    ui.divH([
      ui.h2('Oligo Properties'),
      downloadIcon,
    ], {style: {'display': 'flex', 'align-items': 'center'}}),
  ], 'ui-panel ui-box');
  title.style.maxHeight = '40px';
  $(title).children('h2').css('margin', '0px');

  const additionaModifsGrid = DG.Viewer.grid(additionalModificationsDf, {
    showRowHeader: false,
    showCellTooltip: true,
    allowEdit: (await isCurrentUserAppAdmin()),
  });
  additionaModifsGrid.col(ADDITIONAL_MODS_COL_NAMES.LONG_NAMES)!.width = 110;
  additionaModifsGrid.col(ADDITIONAL_MODS_COL_NAMES.ABBREVIATION)!.width = 80;
  additionaModifsGrid.col(ADDITIONAL_MODS_COL_NAMES.MOLECULAR_WEIGHT)!.width = 105;
  additionaModifsGrid.col(ADDITIONAL_MODS_COL_NAMES.BASE_MODIFICATION)!.width = 110;
  additionaModifsGrid.col(ADDITIONAL_MODS_COL_NAMES.EXTINCTION_COEFFICIENT)!.width = 100;

  // Hide 'CHANGE_LOGS' column, display its content in tooltip
  additionaModifsGrid.columns.setVisible(additionalModificationsDf.columns.names().slice(0, -1));
  additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.CHANGE_LOGS).name = '~' + ADDITIONAL_MODS_COL_NAMES.CHANGE_LOGS;
  additionaModifsGrid.onCellTooltip(function(cell, x, y) {
    if (cell.isTableCell) {
      const v = additionalModificationsDf.getCol('~' + ADDITIONAL_MODS_COL_NAMES.CHANGE_LOGS).get(cell.gridRow).split('; ').slice(0, -1);
      ui.tooltip.show(ui.divText(v), x, y);
      return true;
    }
  });

  const addModificationIcon = ui.iconFA('plus', () => addModificationButton(additionalModificationsDf), 'Add new modidfication');
  $(addModificationIcon).css('margin-left', '5px');
  $(addModificationIcon).css('margin-top', '12px');

  const codesTablesDiv = ui.splitV([
    ui.box(
      ui.divH([
        ui.h2('Additional modifications'),
        addModificationIcon,
      ]), {style: {maxHeight: '40px'}},
    ),
    additionaModifsGrid.root,
  ], {style: {maxWidth: '600px'}});

  additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.BASE_MODIFICATION)
    .setTag(DG.TAGS.CHOICES, stringify(Object.values(BASE_MODIFICATIONS)));

  const clearIcon = ui.iconFA('redo', () => inputSequences.value = '', 'Clear input field');
  $(clearIcon).css('margin-left', '5px');
  $(clearIcon).css('margin-top', '12px');

  const view = grok.shell.newView('Oligo Batch Calculator', [
    ui.splitH([
      ui.splitV([
        ui.box(
          ui.panel([
            ui.h2('Yield Amount & Units'),
            ui.divH([
              yieldAmount.root,
              units.root,
            ]),
            ui.divH([ui.h2('Input Sequences'), clearIcon]),
            ui.div([
              inputSequences.root,
            ], 'inputSequences'),
          ]), {style: {maxHeight: '230px'}},
        ),
        ui.splitV([
          title,
          mainGrid.root,
        ]),
      ]),
      codesTablesDiv,
    ]),
  ]);
  view.box = true;
  view.path = '/apps/OligoBatchCalculator/';
  view.setRibbonPanels([[
    ui.switchInput('Show additional modifications', true, (v: boolean) => {
      (v) ? $(codesTablesDiv).show() : $(codesTablesDiv).hide();
    }).root,
  ]]);

  const col = additionaModifsGrid.col(ADDITIONAL_MODS_COL_NAMES.ACTION)!;
  col.cellType = 'html';
  additionaModifsGrid.onCellPrepare(function(gc) {
    if (gc.isTableCell && gc.gridColumn.name == ADDITIONAL_MODS_COL_NAMES.ACTION) {
      const icon = ui.iconFA('trash-alt');
      gc.style.element = ui.button(icon, () => deleteAdditionalModification(additionalModificationsDf, gc.gridRow));
    }
  });

  let tempValue = '';
  additionalModificationsDf.onCurrentCellChanged.subscribe(() => {
    tempValue = additionalModificationsDf.currentCell.value;
  });

  DG.debounce(additionalModificationsDf.onValuesChanged, 10).subscribe(async (_) => {
    if (!await isCurrentUserAppAdmin())
      return grok.shell.warning('You don\'t have permission for this action');
    if (additionalModificationsDf.currentCol.name == ADDITIONAL_MODS_COL_NAMES.ABBREVIATION) {
      const entries = await grok.dapi.userDataStorage.get(STORAGE_NAME, CURRENT_USER);
      if (additionalModificationsDf.currentCell.value.length > 100)
        return grok.shell.warning('Abbreviation shouldn\'t contain more than 100 characters');
      if (additionalModificationsDf.currentCell.value in entries) {
        additionalModificationsDf.set(additionalModificationsDf.currentCol.name, additionalModificationsDf.currentRowIdx, tempValue);
        return grok.shell.warning('Abbreviation ' + additionalModificationsDf.currentCell.value + ' already exists');
      }
    }
    if (additionalModificationsDf.currentCol.name == ADDITIONAL_MODS_COL_NAMES.LONG_NAMES &&
      additionalModificationsDf.currentCell.value.length > 300)
      return grok.shell.warning('Long Name shouldn\'t contain more than 300 characters');

    const rowIndex = additionalModificationsDf.currentCell.rowIndex;
    if (additionalModificationsDf.currentCol.name == ADDITIONAL_MODS_COL_NAMES.BASE_MODIFICATION) {
      if (additionalModificationsDf.currentCell.value == BASE_MODIFICATIONS.NO) {
        const extCoefChoiceInput = ui.floatInput('', 0);
        ui.dialog('Enter Extinction Coefficient Value')
          .add(extCoefChoiceInput)
          .onOK(() => {
            const col = additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.EXTINCTION_COEFFICIENT);
            col.set(rowIndex, String(extCoefChoiceInput.value), false);
            additionaModifsGrid.invalidate();
          })
          .show();
      } else {
        const col = additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.EXTINCTION_COEFFICIENT);
        col.set(rowIndex, 'Base', false);
        additionaModifsGrid.invalidate();
      }
    }

    await grok.dapi.userDataStorage.postValue(
      STORAGE_NAME,
      additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.ABBREVIATION).get(rowIndex),
      JSON.stringify({
        longName: additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.LONG_NAMES).get(rowIndex),
        abbreviation: additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.ABBREVIATION).get(rowIndex),
        molecularWeight: additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.MOLECULAR_WEIGHT).get(rowIndex),
        extinctionCoefficient: additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.EXTINCTION_COEFFICIENT).get(rowIndex),
        baseModification: additionalModificationsDf.getCol(ADDITIONAL_MODS_COL_NAMES.BASE_MODIFICATION).get(rowIndex),
        changeLogs: additionalModificationsDf.getCol('~' + ADDITIONAL_MODS_COL_NAMES.CHANGE_LOGS).get(rowIndex),
      }),
      CURRENT_USER,
    );
  });
}
