/**
 * Cheminformatics support
 * @module chem
 * */
import {BitSet, Column, DataFrame} from './dataframe';
import {FUNC_TYPES, SEMTYPE, SIMILARITY_METRIC, SimilarityMetric, UNITS} from './const';
import {Subject, Subscription} from 'rxjs';
import {Menu, Widget} from './widgets';
import {Func} from './entities';
import * as ui from '../ui';
import {SemanticValue} from './grid';
import $ from 'cash-dom';
import { FuncCall } from '../dg';
import '../css/styles.css';

let api = <any>window;
declare let grok: any;

const DEFAULT_SKETCHER = 'Open Chem Sketcher';
export const WHITE_MOLBLOCK = `
  Datagrok empty molecule

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`;
export const WHITE_MOLBLOCK_V_3000 = `Datagrok macromolecule handler
0  0  0  0  0  0            999 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 0 0 0 0 0
M  V30 END CTAB
M  END
$$$$`

let extractors: Func[];  // id => molecule


/** Cheminformatics-related routines */
export namespace chem {

  export let SKETCHER_LOCAL_STORAGE = 'sketcher';
  export const STORAGE_NAME = 'sketcher';
  export const KEY = 'selected';

  export enum Notation {
    Smiles = 'smiles',
    Smarts = 'smarts',
    MolBlock = 'molblock', // molblock V2000
    V3KMolBlock = 'v3Kmolblock', // molblock V3000
    Unknown = 'unknown',
  }

  export enum SKETCHER_MODE {
    INPLACE = 'Inplace',
    EXTERNAL = 'External'
  }

  export let currentSketcherType = DEFAULT_SKETCHER;

  export function isMolBlock(s: string | null) {
    return s != null && s.includes('M  END');
  }  

  /** A common interface that all sketchers should implement */
  export abstract class SketcherBase extends Widget {

    onChanged: Subject<any> = new Subject<any>();
    host?: Sketcher;

    constructor() {
      super(ui.box());
    }

    /** SMILES representation of the molecule */
    abstract get smiles(): string;

    abstract set smiles(s: string);

    /** MolFile representation of the molecule */
    abstract get molFile(): string;

    abstract get molV3000(): string;

    abstract set molV3000(s: string);

    abstract set molFile(s: string);

    /** SMARTS query */
    async getSmarts(): Promise<string> {
      return '';
    }

    abstract set smarts(s: string);

    abstract get isInitialized(): boolean;

    get supportedExportFormats(): string[] {
      return [];
    }

    /** Override to provide custom initialization. At this point, the root is already in the DOM. */
    async init(host: Sketcher) {
      this.host = host;
    }

    refresh(): void {}
  }


  /**
   * Molecule sketcher that supports multiple dynamically initialized implementations.
   * */
  export class Sketcher extends Widget {

    molInput: HTMLInputElement = ui.element('input');
    host: HTMLDivElement = ui.box(null, 'grok-sketcher');
    changedSub: Subscription | null = null;
    sketcher: SketcherBase | null = null;
    onChanged: Subject<any> = new Subject<any>();
    sketcherFunctions: Func[] = [];
    selectedSketcher: Func | undefined = undefined;
    sketcherDialogOpened = false;

    /** Whether the currently drawn molecule becomes the current object as you sketch it */
    syncCurrentObject: boolean = true;

    listeners: Function[] = [];
    _mode = SKETCHER_MODE.INPLACE;
    _smiles: string | null = null;
    _molfile: string | null = null;
    _smarts: string | null = null;
    molFileUnits = Notation.MolBlock;


    extSketcherDiv = ui.div([], {style: {cursor: 'pointer'}});
    extSketcherCanvas = ui.canvas();
    inplaceSketcherDiv: HTMLDivElement | null = null;
    clearSketcherButton: HTMLButtonElement;
    emptySketcherLink: HTMLDivElement;

    set sketcherType(type: string) {
      this._setSketcherType(type);
    }

    getSmiles(): string {
      const smilesFromSmartsWarning = () => {
        grok.shell.warning(`Smarts cannot be converted to smiles`);
        return this._smarts!;
      }
      return this.sketcher?.isInitialized ? this.sketcher.smiles : this._smiles === null ?
        this._molfile !== null ? convert(this._molfile, Notation.MolBlock, Notation.Smiles) :
        this._smarts !== null ? smilesFromSmartsWarning() : '' : this._smiles;
    }

    setSmiles(x: string): void {
      this._smiles = x;
      this._molfile = null;
      this._smarts = null;
      if (this.sketcher?.isInitialized)
        this.sketcher!.smiles = x;
    }

    getMolFile(): string {
      if (this.sketcher?.isInitialized) {
        return this.molFileUnits === Notation.MolBlock ? this.sketcher.molFile : this.sketcher.molV3000;
      } else {
        if (this._molfile === null) {
          return this._smiles !== null ? convert(this._smiles, Notation.Smiles, Notation.MolBlock) :
            this._smarts !== null ? convert(this._smarts, Notation.Smarts, Notation.MolBlock) : '';
        } else
          return this._molfile;
      }
    }

    setMolFile(x: string): void {
      this.molFileUnits = x && x.includes('V3000') ? Notation.V3KMolBlock : Notation.MolBlock;
      this._molfile = x;
      this._smiles = null;
      this._smarts = null;
      if (this.sketcher?.isInitialized) {
        this.molFileUnits === Notation.MolBlock ? this.sketcher!.molFile = x : this.sketcher!.molV3000 = x;
      }
    }

    async getSmarts(): Promise<string | null> {
      return this.sketcher?.isInitialized ? await this.sketcher.getSmarts() : !this._smarts === undefined ?
        this._smiles !== null ? convert(this._smiles, Notation.Smiles, Notation.Smarts) :
        this._molfile !== null ? convert(this._molfile, Notation.MolBlock, Notation.Smarts) : '' : this._smarts;
    }

    setSmarts(x: string): void {
      this._smarts = x;
      this._molfile = null;
      this._smiles = null;
      if (this.sketcher?.isInitialized)
        this.sketcher!.smarts = x;
    }

    get supportedExportFormats(): string[] {
      return this.sketcher ? this.sketcher.supportedExportFormats : [];
    }

    isEmpty(): boolean {
      const molFile = this.getMolFile();
      return Sketcher.isEmptyMolfile(molFile);
    }

    /** Sets the molecule, supports either SMILES, SMARTS or MOLBLOCK formats */
    setMolecule(molString: string, substructure: boolean = false): void {
      if (substructure)
        this.setSmarts(molString);
      else if (isMolBlock(molString))
        this.setMolFile(molString);
      else {
        this.setSmiles(molString);
      }
    }

    setChangeListenerCallback(callback: () => void) {
      this.changedSub?.unsubscribe();
      this.listeners.push(callback);
      if (this.sketcher)
        this.changedSub = this.sketcher.onChanged.subscribe((_: any) => callback());
    }

    /** Sets SMILES, MOLBLOCK, or any other molecule representation */
    setValue(x: string) {
      const extractor = extractors
        .find((f) => new RegExp(f.options['inputRegexp']).test(x));

      if (extractor != null)
        extractor
          .apply([new RegExp(extractor.options['inputRegexp']).exec(x)![1]])
          .then((mol) => this.setMolecule(mol));
      else
        this.setMolecule(x);
    }

    constructor(mode?: SKETCHER_MODE) {
      super(ui.div());
      if (mode)
        this._mode = mode;
      this.root.append(ui.div([ui.divText('')]));
      this.clearSketcherButton = this.createClearSketcherButton(this.extSketcherCanvas);
      this.emptySketcherLink = ui.divText('Click to edit', 'sketch-link');
      ui.tooltip.bind(this.emptySketcherLink, 'Click to edit');
      setTimeout(() => this.createSketcher(), 100);
    }

    /** In case sketcher is opened in filter panel use EXTERNAL mode*/
    setExternalModeForSubstrFilter() {
      if (this.root.closest('.d4-filter'))
        this._mode = SKETCHER_MODE.EXTERNAL;
    }

    createSketcher() {
      this.sketcherFunctions = Func.find({tags: ['moleculeSketcher']});
      this.setExternalModeForSubstrFilter();
      this.root.innerHTML = '';
      if (this._mode === SKETCHER_MODE.INPLACE)
        this.root.appendChild(this.createInplaceModeSketcher());
      else
        this.root.appendChild(this.createExternalModeSketcher());
    }

    updateExtSketcherContent() {
      ui.tools.waitForElementInDom(this.extSketcherDiv).then((_) => {
        const width = this.extSketcherDiv.parentElement!.clientWidth < 100 ? 100 : this.extSketcherDiv.parentElement!.clientWidth;
        const height = width / 2;
        if (!(this.isEmpty()) && this.extSketcherDiv.parentElement) {
          ui.empty(this.extSketcherDiv);
          this.setCanvasSize(this.extSketcherCanvas, width, height);
          ui.tooltip.bind(this.extSketcherCanvas, 'Click to edit');
          canvasMol(0, 0, this.extSketcherCanvas.width, this.extSketcherCanvas.height, this.extSketcherCanvas, this.getMolFile()!, null, { normalizeDepiction: true, straightenDepiction: true })
            .then((_) => {
              ui.empty(this.extSketcherDiv);
              this.extSketcherDiv.append(this.extSketcherCanvas);
              this.extSketcherDiv.append(this.clearSketcherButton);
            });
        } else {
          ui.empty(this.extSketcherDiv);
          this.extSketcherDiv.append(this.emptySketcherLink);
        }
      });
    };

    createClearSketcherButton(canvas: HTMLCanvasElement): HTMLButtonElement {
      const clearButton = ui.button('Clear', () => {
        this.setMolecule('');
        if (!this.sketcher) {
          this.onChanged.next(null);
        }
        this.updateExtSketcherContent();
      });
      ui.tooltip.bind(clearButton, 'Clear sketcher');
      clearButton.classList.add('clear-button');
      clearButton.onmouseover = () => {clearButton.style.visibility = 'visible';};
      canvas.onmouseenter = () => {clearButton.style.visibility = 'visible';};
      canvas.onmouseout = () => {clearButton.style.visibility = 'hidden';};
      return clearButton;
    }

    createExternalModeSketcher(): HTMLElement {
      this.extSketcherDiv = ui.div([], {style: {cursor: 'pointer'}});

      this.extSketcherDiv.onclick = () => {
        if (!this.sketcherDialogOpened) {
          this.sketcherDialogOpened = true;
          let savedMolFile = this.getMolFile();

          let dlg = ui.dialog();
          dlg.add(this.createInplaceModeSketcher())
            .onOK(() => {
              this.updateExtSketcherContent();
              Sketcher.addToCollection(Sketcher.RECENT_KEY, this.getMolFile());
              this.sketcherDialogOpened = false;
            })
            .onCancel(() => {
              this.setMolFile(savedMolFile!);
              this.sketcherDialogOpened = false;
            })
            .show();
        }
      };

      ui.onSizeChanged(this.extSketcherDiv).subscribe((_) => {
        if (!this.isEmpty() ?? !this.extSketcherDiv.closest('d4-popup-host'))
          this.updateExtSketcherContent();
      });

      this.updateExtSketcherContent();
      return this.extSketcherDiv;
    }

    createInplaceModeSketcher(): HTMLElement {
      const molInputDiv = ui.div();
      $(this.molInput).attr('placeholder', 'SMILES, MOLBLOCK, Inchi, ChEMBL id, etc');

      if (extractors == null) {
        grok.dapi.functions.filter('options.role="converter"').list()
          .then((res: Func[]) => {
            extractors = res.filter(it => it.outputs.filter(o => o.semType == SEMTYPE.MOLECULE).length);
          })
          .catch((_: any) => {
            extractors = [];
          });
      }

      const applyInput = (e: any) => {
        const newSmilesValue: string = (e?.target as HTMLTextAreaElement).value;

        if (this.getSmiles() !== newSmilesValue)
          this.setValue(newSmilesValue);

        const currentSmiles = this.getSmiles();

        if (currentSmiles !== newSmilesValue)
          (e?.target as HTMLTextAreaElement).value = currentSmiles ?? '';
      };

      this.molInput.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
          applyInput(e);
          e.stopImmediatePropagation();
        }
      });

      this.molInput.addEventListener('paste', (e) => {
        const text = e.clipboardData?.getData('text/plain');
        if (text != null && isMolBlock(text)) {
          e.preventDefault();
          this.setValue(text);
        }
      });

      let optionsIcon = ui.iconFA('bars', () => {
        Menu.popup()
          .item('Copy as SMILES', () => navigator.clipboard.writeText(this.getSmiles()))
          .item('Copy as MOLBLOCK', () => navigator.clipboard.writeText(this.getMolFile()))
          .group('Recent')
          .items(Sketcher.getCollection(Sketcher.RECENT_KEY).map((m) => ui.tools.click(this.drawToCanvas(150, 60, m), () => this.setMolecule(m))), () => { })
          .endGroup()
          .group('Favorites')
          .item('Add to Favorites', () => Sketcher.addToCollection(Sketcher.FAVORITES_KEY, this.getMolFile()))
          .separator()
          .items(Sketcher.getCollection(Sketcher.FAVORITES_KEY).map((m) => ui.tools.click(this.drawToCanvas(150, 60, m), () => this.setMolecule(m))), () => { })
          .endGroup()
          .separator()
          .items(this.sketcherFunctions.map((f) => f.friendlyName), (friendlyName: string) => {
            grok.dapi.userDataStorage.postValue(STORAGE_NAME, KEY, friendlyName, true);
            currentSketcherType = friendlyName;
            this.sketcherType = currentSketcherType;
            },
            {
              isChecked: (item) => item === this.selectedSketcher?.friendlyName, toString: item => item,
              radioGroup: 'sketcher type'
            })
          .show();
      });
      $(optionsIcon).addClass('d4-input-options');
      molInputDiv.append(ui.div([this.molInput, optionsIcon], 'grok-sketcher-input'));
      this.sketcherType = currentSketcherType;

      this.inplaceSketcherDiv = ui.div([
        molInputDiv,
        this.host]);

      return this.inplaceSketcherDiv;
    }


    private _setSketcherType(sketcherType: string): void {
      const getMolecule = async () => {
        return this._smiles === null ? this._molfile === null ? this._smarts === null ? this.getMolFile() :
          await this.getSmarts() : this.getMolFile() : this.getSmiles();
      };
      getMolecule().then(async (molecule) => {
        ui.empty(this.host);
        this.host.classList.remove('extended-width'); //need to remove class to reset width
        ui.setUpdateIndicator(this.host, true);
        this.changedSub?.unsubscribe();
        const sketcherFunc = this.sketcherFunctions.find(e => e.friendlyName == sketcherType|| e.name === sketcherType) ?? this.sketcherFunctions.find(e => e.friendlyName == DEFAULT_SKETCHER);
        this.sketcher = await sketcherFunc!.apply();
        this.host.classList.add('sketcher-standard-size');
        this.host.appendChild(this.sketcher!.root);
        await ui.tools.waitForElementInDom(this.root);
        await this.sketcher!.init(this);
        ui.setUpdateIndicator(this.host, false);      
        this.changedSub = this.sketcher!.onChanged.subscribe((_: any) => {
          this.onChanged.next(null);
          for (let callback of this.listeners)
            callback();
          if (this.syncCurrentObject) {
            const molFile = this.getMolFile();
            if (!Sketcher.isEmptyMolfile(molFile))
              grok.shell.o = SemanticValue.fromValueType(molFile, SEMTYPE.MOLECULE, UNITS.Molecule.MOLBLOCK);
          }
        });
        if (molecule)              
        this.setMolecule(molecule!, this._smarts !== null);
      });
    }

    static readonly FAVORITES_KEY = 'chem-molecule-favorites';
    static readonly RECENT_KEY = 'chem-molecule-recent';

    static getCollection(key: string): string[] {
      return JSON.parse(localStorage.getItem(key) ?? '[]');
    }
    
    static addToCollection(key: string, molecule: string) {
      const molecules = Sketcher.getCollection(key);
      Sketcher.checkDuplicatesAndAddToStorage(molecules, molecule, key);
    }

    static checkDuplicatesAndAddToStorage(storage: string[], molecule: string, localStorageKey: string) {
      if (!Sketcher.isEmptyMolfile(molecule)) {
        storage.length ?
        grok.functions
          .call('Chem:removeDuplicates', { molecules: storage, molecule: molecule })
          .then((array: any) => localStorage.setItem(localStorageKey, JSON.stringify([molecule, ...array.slice(0, 9)]))) :
        localStorage.setItem(localStorageKey, JSON.stringify([molecule]));
      }
    }

    static isEmptyMolfile(molFile: string): boolean {
      const rowWithAtomsAndNotation = molFile && molFile.split("\n").length >= 4 ? molFile.split("\n")[3] : '';
      return (molFile == null || molFile == '' ||
       (rowWithAtomsAndNotation.trimStart()[0] === '0' && rowWithAtomsAndNotation.trimEnd().endsWith('V2000')) ||
       (rowWithAtomsAndNotation.trimEnd().endsWith('V3000') && molFile.includes('COUNTS 0')));
    }


    detach() {
      this.changedSub?.unsubscribe();
      this.sketcher?.detach();
      super.detach();
    }

    drawToCanvas(w: number, h: number, molecule: string): HTMLElement{
      const imageHost = ui.canvas();
      this.setCanvasSize(imageHost, w, h);
      canvasMol(0, 0, imageHost.width, imageHost.height, imageHost, molecule, null, {normalizeDepiction: true, straightenDepiction: true});
      return imageHost;
    }

    setCanvasSize(canvas: HTMLCanvasElement, w: number, h: number) {
      $(canvas).addClass('chem-canvas');
      const r = window.devicePixelRatio;
      canvas.width = w * r;
      canvas.height = h * r;
      canvas.style.width = (w).toString() + 'px';
      canvas.style.height = (h).toString() + 'px';
    }
  }

  /**
   * Computes similarity scores for molecules in the input vector based on a preferred similarity score.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/similarity-scoring-scores}
   * @async
   * @param {Column} column - Column with molecules to search in
   * @param {string} molecule - Reference molecule in one of formats supported by RDKit:
   *   smiles, cxsmiles, molblock, v3Kmolblock, and inchi
   * @param {Object} settings - Properties for the similarity function (type, parameters, etc.)
   * @returns {Promise<Column>} - Column of corresponding similarity scores
   * */
  export async function getSimilarities(column: Column, molecule: string = '', settings: object = {}): Promise<Column | null> {

    const result = await grok.functions.call('Chem:getSimilarities', {
      'molStringsColumn': column,
      'molString': molecule
    });
    // TODO: figure out what's the state in returning columns from package functions
    return (molecule.length != 0) ? result.columns.byIndex(0) : null;

  }

  /**
   * Computes similarity scores for molecules in the input vector based on a preferred similarity score.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/similarity-scoring-sorted}
   * @async
   * @param {Column} column - Column with molecules to search in
   * @param {string} molecule - Reference molecule in one of formats supported by RDKit:
   *   smiles, cxsmiles, molblock, v3Kmolblock, and inchi
   * @param {Object} settings - Properties for the similarity function
   * @param {int} settings.limit - Would return top limit molecules based on the score
   * @param {int} settings.cutoff - Would drop molecules which score is lower than cutoff
   * @returns {Promise<DataFrame>} - DataFrame with 3 columns:
   *   - molecule: original molecules string representation from the input column
   *   - score: similarity scores within the range from 0.0 to 1.0;
   *            DataFrame is sorted descending by this column
   *   - index: indices of the molecules in the original input column
   * */
  export async function findSimilar(column: Column, molecule: string = '', settings = {
    limit: Number.MAX_VALUE,
    cutoff: 0.0
  }): Promise<DataFrame | null> {
    const result = await grok.functions.call('Chem:findSimilar', {
      'molStringsColumn': column,
      'molString': molecule,
      'limit': settings.limit,
      'cutoff': settings.cutoff
    });
    return (molecule.length != 0) ? result : null;
  }


  /**
   * Returns the specified number of most diverse molecules in the column.
   * See example: {@link https://datagrok.ai/help/domains/chem/diversity-search}
   * @async
   * @param {Column} column - Column with molecules to search in
   * @param {Object} settings - Settings
   * @param {int} settings.limit - Would return top limit molecules
   * @returns {Promise<DataFrame>} - DataFrame with 1 column:
   *   - molecule: set of diverse structures
   * */
  export async function diversitySearch(column: Column, settings = {limit: Number.MAX_VALUE}): Promise<DataFrame> {
    const result = await grok.functions.call('Chem:getDiversities', {
      'molStringsColumn': column,
      'limit': settings.limit
    });
    return result;
  }

  /**
   * Searches for a molecular pattern in a given column, returning a bitset with hits.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/substructure-search-library}
   * @async
   * @param {Column} column - Column with molecules to search
   * @param {string} pattern - Pattern, either one of which RDKit supports
   * @param settings
   * @returns {Promise<BitSet>}
   * */
  export async function searchSubstructure(column: Column, pattern: string = '', settings: {
    molBlockFailover?: string;
  } = {}): Promise<BitSet> {

    return (await grok.functions.call('Chem:searchSubstructure', {
      'molStringsColumn': column,
      'molString': pattern,
      'molBlockFailover': (settings.hasOwnProperty('molBlockFailover') ? settings.molBlockFailover : '') ?? ''
    })).get(0);
  }

  /**
   * Performs R-group analysis.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/descriptors}
   * @async
   * @param {DataFrame} table - Table.
   * @param {string} column - Column name with molecules to analyze.
   * @param {string} core - Core molecule.
   * @returns {Promise<DataFrame>}
   * */
  export async function rGroup(table: DataFrame, column: string, core: string): Promise<DataFrame> {
    return await grok.functions.call('Chem:FindRGroups', {
      column, table, core, prefix: 'R'
    });
  }

  /**
   * Finds Most Common Substructure in the specified column.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/mcs}
   * @async
   * @param {Column} column - Column with SMILES to analyze.
   * @returns {Promise<string>}
   * */
  export async function mcs(table: DataFrame, column: string, returnSmarts: boolean = false): Promise<string> {
    return await grok.functions.call('Chem:FindMCS', {
      'molecules': column,
      'df': table,
      'returnSmarts': returnSmarts
    });
  }

  /**
   * Calculates specified descriptors for the molecular column.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/descriptors}
   *
   * @async
   * @param {DataFrame} table - Table.
   * @param {string} column - Column name with SMILES to calculate descriptors for.
   * @param {string[]} descriptors - RDKit descriptors to calculate.
   * @returns {Promise<DataFrame>}
   * */
  export function descriptors(table: DataFrame, column: string, descriptors: string[]): Promise<DataFrame> {
    return new Promise((resolve, reject) => api.grok_Chem_Descriptors(table.dart, column, descriptors, () => resolve(table), (e: any) => reject(e)));
  }

  /**
   * Returns available descriptors tree.
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/descriptors}
   * */
  export function descriptorsTree(): Promise<object> {
    return new Promise((resolve, reject) => api.grok_Chem_DescriptorsTree((tree: any) => resolve(JSON.parse(tree)), (e: any) => reject(e)));
  }

  /**
   * Renders a molecule to SVG
   * See example: {@link https://public.datagrok.ai/js/samples/domains/chem/mol-rendering}
   * @param {string} smiles - accepts smiles/molfile format
   * @param {number} width
   * @param {number} height
   * @param {object} options - OCL.IMoleculeToSVGOptions
   * @returns {HTMLDivElement}
   * */
  export function svgMol(
    smiles: string, width: number = 300, height: number = 200,
    options?: { [key: string]: boolean | number | string }
  ): HTMLDivElement {
    let root = document.createElement('div');
    // @ts-ignore
    import('openchemlib/full.js').then((OCL) => {
      let m = smiles.includes('M  END') ? OCL.Molecule.fromMolfile(smiles) : OCL.Molecule.fromSmiles(smiles);
      root.innerHTML = m.toSVG(width, height, undefined, options);
    });
    return root;
  }

  /**
   * Renders a molecule to canvas (using RdKit)
   * TODO: should NOT be async
   * See example: {@link }
   * */
  export async function canvasMol(
    x: number, y: number, w: number, h: number,
    canvas: Object, molString: string, scaffoldMolString: string | null = null,
    options = {normalizeDepiction: true, straightenDepiction: true}
  ): Promise<void> {
    await grok.functions.call('Chem:canvasMol', {
      'x': x, 'y': y, 'w': w, 'h': h, 'canvas': canvas,
      'molString': molString, 'scaffoldMolString': scaffoldMolString ?? '',
      'options': options
    });
  }

    export function drawMolecule(molString: string, w?: number, h?: number): HTMLDivElement {
      const molDiv = ui.div();
      grok.functions
      .call('Chem:drawMolecule', {
        'molStr': molString, 'w': w, 'h': h, 'popupMenu': false
      })
      .then((res: HTMLElement) => molDiv.append(res));
      return molDiv;
    }

  /**
   * Sketches Molecule sketcher.
   * @param {function} onChangedCallback - a function that accepts (smiles, molfile)
   * @param {string} smiles Initial molecule
   * @returns {HTMLElement}
   * */
  export function sketcher(onChangedCallback: Function, smiles: string = ''): HTMLElement {
    return api.grok_Chem_Sketcher(onChangedCallback, smiles);
  }


  export function convert(s: string, sourceFormat: Notation, targetFormat: Notation): string {
    const convertFunc = Func.find({package: 'Chem', name: 'convertMolNotation'})[0];
    const funcCall: FuncCall = convertFunc.prepare({molecule: s, sourceNotation: sourceFormat, targetNotation: targetFormat});
    funcCall.callSync();
    const resultMolecule = funcCall.getOutputParamValue();
    return resultMolecule;
  }
  
}

