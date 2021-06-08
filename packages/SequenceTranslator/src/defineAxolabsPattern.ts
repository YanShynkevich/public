/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
// @ts-ignore
import * as svg from 'save-svg-as-png';

import {drawAxolabsPattern} from "./drawAxolabsPattern";
import {axolabsMap} from "./axolabsMap";
/*
SS - sense strand of DNA;
AS - antisense strand of DNA;
base - indicates how to translate input nucleotide;
PTO - indicates whether oligonucleotide is phosphorothioated (ps linkage);
Pattern design - section of dialog for changing length of AS and SS by editing corresponding checkboxes;
SS/AS Modification - sections of dialog for changing base and PTO statuses of one nucleotide at once: for SS or for AS;
*/

const baseChoices: string[] = Object.keys(axolabsMap);
const defaultBase: string = baseChoices[0];
const defaultPto: boolean = false;
const defaultSequenceLength: number = 23;
const maximalValidSequenceLength: number = 35;
const userStorageKey: string = 'SequenceTranslator';


export function defineAxolabsPattern() {

  function updateAsModification() {
    asModificationItems.innerHTML = '';
    asPtoLinkages = (asLength.value > asPtoLinkages.length) ?
      asPtoLinkages.concat(Array(asLength.value - asPtoLinkages.length).fill(fullyPto)) :
      asPtoLinkages.slice(asPtoLinkages.length - asLength.value);
    asBases = (asLength.value > asBases.length) ?
      asBases.concat(Array(asLength.value - asBases.length).fill(sequenceBase)) :
      asBases.slice(asBases.length - asLength.value);
    for (let i = 0; i < asLength.value; i++) {
      asPtoLinkages[i] = ui.boolInput('', asPtoLinkages[i].value, () => updateSvgScheme());
      asBases[i] = ui.choiceInput('', asBases[i].value, baseChoices, () => updateSvgScheme());
      asModificationItems.append(
        ui.divH([
          ui.block25([ui.label((i + 1).toString())])!,
          ui.block50([asBases[i]])!,
          ui.block25([asPtoLinkages[i]])!
        ], {style: {alignItems: "center"}})
      );
    }
  }

  function updateSsModification() {
    ssModificationItems.innerHTML = '';
    ssPtoLinkages = (ssLength.value > ssPtoLinkages.length) ?
      ssPtoLinkages.concat(Array(ssLength.value - ssPtoLinkages.length).fill(fullyPto)) :
      ssPtoLinkages.slice(ssPtoLinkages.length - ssLength.value);
    ssBases = (ssLength.value > ssBases.length) ?
      ssBases.concat(Array(ssLength.value - ssBases.length).fill(sequenceBase)) :
      ssBases.slice(ssBases.length - ssLength.value);
    for (let i = 0; i < ssLength.value; i++) {
      ssPtoLinkages[i] = ui.boolInput('', ssPtoLinkages[i].value, () => updateSvgScheme());
      ssBases[i] = ui.choiceInput('', ssBases[i].value, baseChoices, () => updateSvgScheme());
      ssModificationItems.append(
        ui.divH([
          ui.block25([ui.label((i + 1).toString())])!,
          ui.block50([ssBases[i]])!,
          ui.block25([ssPtoLinkages[i]])!
        ], {style: {alignItems: "center"}})
      );
    }
  }

  function updateUiForNewSequenceLength() {
    if (ssLength.value < maximalValidSequenceLength && asLength.value < maximalValidSequenceLength) {
      updateSsModification();
      updateAsModification();
      updateSvgScheme();
    } else {
      ui.dialog('Sequence length should be less than ' + maximalValidSequenceLength.toString() + ' due to UI constrains')
        .add(ui.divText('Please change sequence length in order to define new pattern'))
        .show();
    }
  }

  function updatePtoAllAtOnce(newPtoValue: boolean) {
    for (let i = 0; i < ssPtoLinkages.length; i++) {
      ssPtoLinkages[i].value = newPtoValue;
    }
    for (let i = 0; i < asPtoLinkages.length; i++) {
      asPtoLinkages[i].value = newPtoValue;
    }
    updateSvgScheme();
  }

  function updateBasisAllAtOnce(newBasisValue: string) {
    for (let i = 0; i < ssBases.length; i++) {
      ssBases[i].value = newBasisValue;
    }
    for (let i = 0; i < asBases.length; i++) {
      asBases[i].value = newBasisValue;
    }
    updateSvgScheme();
  }

  function updateSvgScheme() {
    svgDiv.innerHTML = '';
    svgDiv.append(
      ui.span([
        drawAxolabsPattern(
          (newPatternName.value == '') ? applyExistingDesign.value : newPatternName.value,
          createAsStrand.value,
          ssBases.slice(0, ssLength.value).map((e) => e.value),
          asBases.slice(0, asLength.value).map((e) => e.value),
          ssPtoLinkages.slice(0, ssLength.value).map((e) => e.value),
          asPtoLinkages.slice(0, asLength.value).map((e) => e.value),
          threeModification.value,
          fiveModification.value
        )
      ])
    );
  }

  function addColumnsFields() {
    chooseSsColumnDiv.innerHTML = '';
    chooseAsColumnDiv.innerHTML = '';
    let chosenInputSsColumn = ui.choiceInput('SS Column', '', grok.shell.table(tables.value).columns.names());
    let chosenInputAsColumn = ui.choiceInput('AS Column', '', grok.shell.table(tables.value).columns.names());
    chooseSsColumnDiv.append(chosenInputSsColumn.root);
    if (createAsStrand.value) chooseAsColumnDiv.append(chosenInputAsColumn.root);
    convertSequenceDiv.innerHTML = '';
    convertSequenceDiv.append(
      ui.button('Convert Sequences', () => convertSequence(chosenInputSsColumn.value, chosenInputAsColumn.value))
    );
  }

  function convertSequence(chosenInputSsColumn: string, chosenInputAsColumn: string) {
    let count: number = -1;
    grok.shell.table(tables.value).columns.addNewString('Axolabs ' + chosenInputSsColumn).init((i: number) => {
      count = -1;
      return grok.shell.table(tables.value).columns.byName(chosenInputSsColumn).get(i).replace(/[AUGC]/g, function (x: string) {
        count++;
        let ind = axolabsMap["RNA"]["symbols"].indexOf(x);
        let v = axolabsMap[ssBases[count].value]["symbols"][ind];
        return (ssPtoLinkages[count].value) ? v + 's' : v;
      })
    });
    if (createAsStrand.value)
      grok.shell.table(tables.value).columns.addNewString('Axolabs ' + chosenInputAsColumn).init((i: number) => {
        count = -1;
        return grok.shell.table(tables.value).columns.byName(chosenInputAsColumn).get(i).replace(/[AUGC]/g, function (x: string) {
          count++;
          let ind = axolabsMap["RNA"]["symbols"].indexOf(x);
          let v = axolabsMap[asBases[count].value]["symbols"][ind];
          return (asPtoLinkages[count].value) ? v + 's' : v;
        });
      });
  }

  function savePattern() {
    let inputObj = {
      "name": (newPatternName.value == '') ? applyExistingDesign.value : newPatternName.value,
      "ssBases": String(ssBases.slice(0, ssLength.value).map((e) => e.value)),
      "asBases": String(asBases.slice(0, asLength.value).map((e) => e.value)),
      "ssPtoLinkages": String(ssPtoLinkages.slice(0, ssLength.value).map((e) => e.value)),
      "asPtoLinkages": String(asPtoLinkages.slice(0, asLength.value).map((e) => e.value))
    };
    async function saveInUserStorage(storageName: string, value: string) {
      //// @ts-ignore
      await grok.dapi.userDataStorage.post(storageName, value, false);
    }
    saveInUserStorage(userStorageKey, JSON.stringify(inputObj));
    saveImage();
  }

  function saveImage() {
    svg.saveSvgAsPng(document.getElementById('mySvg'), 'diagram.png');
  }

  function getPatterns() {
    grok.dapi.userDataStorage.get(userStorageKey).then((entities) => {
      if (entities !== null && Object.keys(entities).length === 0)
        grok.shell.info('No pattern saved');
      else {
        // @ts-ignore
        let values = JSON.parse(entities);
        return values['name'];
      }
      return [];
    });
  }

  let ssModificationItems = ui.div([]),
    asModificationItems = ui.div([]),
    chooseAsColumnDiv = ui.div([]),
    chooseSsColumnDiv = ui.div([]),
    svgDiv = ui.div([]),
    convertSequenceDiv = ui.div([]);

  let ssBases = Array(defaultSequenceLength).fill(ui.choiceInput('', defaultBase, baseChoices)),
    asBases = Array(defaultSequenceLength).fill(ui.choiceInput('', defaultBase, baseChoices)),
    ssPtoLinkages = Array(defaultSequenceLength).fill(ui.boolInput('', defaultPto)),
    asPtoLinkages = Array(defaultSequenceLength).fill(ui.boolInput('', defaultPto));

  let ssLength = ui.intInput('SS Length', defaultSequenceLength, () => updateUiForNewSequenceLength());
  let asLength = ui.intInput('AS Length', defaultSequenceLength, () => updateUiForNewSequenceLength());

  let tables = ui.choiceInput('Tables', '', grok.shell.tableNames, (name: string) => addColumnsFields());

  let sequenceBase = ui.choiceInput('Sequence Basis', defaultBase, baseChoices, (v: string) => updateBasisAllAtOnce(v));

  let fullyPto = ui.boolInput('Fully PTO', defaultPto, (v: boolean) => updatePtoAllAtOnce(v));

  let createAsStrand = ui.boolInput('Create AS Strand', true, (v: boolean) => {
    asModificationSection.hidden = (!v);
    chooseAsColumnDiv.hidden = (!v);
    updateSvgScheme();
  });

  let newPatternName = ui.stringInput('New Pattern Name', '', () => updateSvgScheme());
  newPatternName.setTooltip('New Pattern Name');
  let existingPatterns = getPatterns();
  let applyExistingDesign = ui.choiceInput('Apply Existing Pattern', '', ['Var-3A97'], () => updateSvgScheme());
  applyExistingDesign.setTooltip('Apply Existing Pattern');

  let threeModification = ui.stringInput("Addidional 3' Modification", "", () => updateSvgScheme());
  threeModification.setTooltip("Addidional 3' Modification");
  let fiveModification = ui.stringInput("Addidional 5' Modification", "", () => updateSvgScheme());
  fiveModification.setTooltip("Addidional 5' Modification");

  updateUiForNewSequenceLength();

  let patternDesignSection = ui.panel([
    ui.h1('Pattern Design'),
    ui.divH([
      ui.div([
        tables.root,
        chooseSsColumnDiv,
        chooseAsColumnDiv,
        newPatternName.root,
        applyExistingDesign.root,
        ssLength.root,
        asLength.root,
        sequenceBase.root,
        fullyPto.root,
        createAsStrand.root
      ], 'ui-form'),
      ui.inputs([
        threeModification,
        fiveModification
      ], {})
    ], {style: {flexWrap: 'wrap'}}),
    ui.block([
      svgDiv
    ], {style: {overflowX: 'scroll'}}),
    ui.divH([
      ui.button('Save Pattern', () => {
        if (newPatternName.value != '' || applyExistingDesign.value != '') {
          savePattern();
        } else {
          let name = ui.textInput('', '');
          ui.dialog('Enter name of new pattern')
            .add(name.root)
            .onOK(() => {
              newPatternName.value = name.value;
              savePattern();
              saveImage();
            })
            .show();
        }
      }),
      convertSequenceDiv
    ])
  ]);

  let ssModificationSection = ui.box(
    ui.panel([
    ui.h1('Sense Strand'),
    ui.divH([
      ui.block25([ui.divText('#')])!,
      ui.block50([ui.divText('Modification')])!,
      ui.block25([ui.divText('PTO')])!
    ]),
    ssModificationItems
  ])!, {style: {maxWidth: '250px'}});

  let asModificationSection = ui.box(
    ui.panel([
      ui.h1('Antisense Strand'),
      ui.divH([
        ui.block25([ui.divText('#')])!,
        ui.block50([ui.divText('Modification')])!,
        ui.block25([ui.divText('PTO')])!
      ]),
      asModificationItems
  ])!, {style: {maxWidth: '250px'}});

  let appAxolabsDescription = ui.info(
    [
      ui.divText("\n How to define new pattern:",{style:{'font-weight':'bolder'}}),
      ui.divText("1. Choose table and columns with sense and antisense strands"),
      ui.divText("2. Choose lengths of both strands by editing checkboxes below"),
      ui.divText("3. Choose basis and PTO status for each nucleotide"),
      ui.divText("4. Set additional modifications for sequence edges"),
      ui.divText("5. Press 'Convert Sequences' button"),
      ui.divText("This will add the result column(s) to the right of the table"),
    ], 'Create and apply Axolabs translation patterns.'
  );

  return ui.splitH([
    ui.div([
      appAxolabsDescription,
      patternDesignSection!,
    ])!,
    ssModificationSection,
    asModificationSection
  ]);
}