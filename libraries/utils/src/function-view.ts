/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import wu from 'wu';
import $ from 'cash-dom';

export class FunctionView extends DG.ViewBase {
  protected readonly context: DG.Context;
  protected _funcCall?: DG.FuncCall;
  protected _lastCall?: DG.FuncCall;
  protected _type: string = 'function';

  constructor(funcCall?: DG.FuncCall) {
    super();
    this.box = true;
    this.context = DG.Context.cloneDefault();

    if (!funcCall) return;

    this.basePath = `/${funcCall.func.name}`;
    this.linkFunccall(funcCall);
    this.init();
    this.build();
    this.name = funcCall.func.friendlyName;
  }

  /**
   * Get current function call of the view
   * @returns The actual funccall associated with the view
   * @stability Stable
 */
  public get funcCall(): DG.FuncCall | undefined {
    return this._funcCall;
  }

  /**
   * Get Func of the view
   * @returns The actual func associated with the view
   * @stability Stable
 */
  get func() {
    return this.funcCall?.func;
  }

  /**
   * Get data of last call of associated function
   * @returns The actual func associated with the view
   * @stability Stable
 */
  get lastCall() {
    return this._lastCall;
  }

  /**
   * Set data of last call of associated function
   * @stability Stable
 */
  set lastCall(lastCall: DG.FuncCall | undefined) {
    this._lastCall = lastCall;
  }

  /**
   * View type
   * @stability Stable
 */
  public get type(): string {
    return this._type;
  }

  /** Export options. Could be overriden partially, using default implementation of each option.
    * @stability Stable
  */
  exportConfig: {
    /** Override to provide custom export logic.
      * Default implementation {@link defaultExport} heavily relies on the default implementation of {@link buildIO}.
      * @returns Blob with data to be exported into the file.
      * @stability Stable
    */
    export: ((format: string) => Promise<Blob>);


    /** Filename for exported files. Override for custom filenames.
      * Default implementation is {@link defaultExportFilename}
      * @param format Format name to be exported
      * @returns The actual filename to be used for the generated file.
      * @stability Stable
    */
    filename: ((format: string) => string);

    /** Override to provide custom list of supported export formats.
     * Default implementation is {@link defaultSupportedExportFormats}
     * These formats are available under the "Export" popup on the ribbon panel.
     * @returns The array of formats available for the export.
     * @stability Stable
    */
    supportedFormats: string[];

    /** Override to provide custom file extensions for exported formats.
       * Default implementation is {@link defaultSupportedExportExtensions}
       * These extensions are used in filenames {@link exportFilename}.
       * @returns The mapping between supported export formats and their extensions.
       * @stability Stable
     */
    supportedExtensions: Record<string, string>;
  } | null = null;

  /**
   * Link FuncCall to the view
   * @param funcCall The actual funccall to be associated with the view
   * @stability Stable
 */
  public linkFunccall(funcCall: DG.FuncCall) {
    this._funcCall = funcCall;

    if (funcCall.options['isHistorical']) {
      this.path = `?id=${this._funcCall.id}`;
      this.name = `${this.name}: ${funcCall.options['title'] ?? new Date(funcCall.started.toString()).toLocaleString('en-us', {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'})}`;
    }
  }

  /**
   * Method for custom logic that could not be placed in the constructor.
   * Any async methods and most of the logic should be placed here.
   * @stability Stable
 */
  public async init() {
    if (this.funcCall && this.func) {
      this.funcCall.aux['view'] = this;
      this.funcCall.context = this.context;

      for (const inParam of wu(this.funcCall.inputParams.values() as DG.FuncCallParam[])
        .filter((p: DG.FuncCallParam) =>
          p.property.propertyType == DG.TYPE.DATA_FRAME && p.property.options['viewer'] != null)) {
        this.subs.push(inParam.onChanged.subscribe(async (param: DG.FuncCallParam) => {
          this.clearResults(false);
          param.processOutput();

          this.appendOutputDf(param, {
            height: 400,
            category: 'Input'
          });
        }));
      }
    }
  }

  /**
   * Override to create a fully custom UI including ribbon menus and panels
   * @stability Stable
 */
  public build(): void {
    this.root.appendChild(this.buildIO());

    this.buildRibbonPanels();
    this.buildHistoryBlock();
    this.buildRibbonMenu();
  }

  /**
   * Override to create a custom input-output block
   * @returns The HTMLElement with whole UI excluding ribbon menus and panels
   * @stability Stable
 */
  public buildIO(): HTMLElement {
    this.exportConfig = {
      supportedExtensions: this.defaultSupportedExportExtensions(),
      supportedFormats: this.defaultSupportedExportFormats(),
      export: this.defaultExport,
      filename: this.defaultExportFilename,
    };

    const inputBlock = this.buildInputBlock();
    const outputBlock = this.buildOutputBlock();

    return ui.splitH([inputBlock, outputBlock]);
  }


  /**
   * Override to create a custom input block
   * @returns The HTMLElement with input block UI on the left side by default
   * @stability Stable
 */
  public buildInputBlock(): HTMLElement {
    if (!this.funcCall) return this.controlsRoot;

    const funcDiv = ui.div([this.renderRunSection(this.funcCall)], 'ui-div');
    ui.empty(this.controlsRoot);
    this.controlsRoot.appendChild(funcDiv);
    return this.controlsRoot;
  }

  /**
   * Override to create a custom output block.
   * @returns The HTMLElement with input block UI on the left side by default
   * @stability Stable
 */
  public buildOutputBlock(): HTMLElement {
    ui.empty(this.resultsRoot);
    this.resultsRoot.appendChild(this.resultsDiv);
    return this.resultsRoot;
  }

  /**
   * Override to create a custom historical runs control.
   * @returns The HTMLElement with history block UI
   * @stability Experimental
 */
  public buildHistoryBlock(): HTMLElement {
    const newHistoryBlock = ui.iconFA('history', () => {
      this.pullRuns(this.func!.id).then(async (historicalRuns) => {
        console.log(historicalRuns);
        const menu = DG.Menu.popup();
        for (const run of historicalRuns) {
          menu.item(`${run.func.friendlyName} — ${run.id}`, async () => {
            const loadedRun = await this.loadRun(run.id);
            console.log(loadedRun);
          });
        }

        menu.show();
      });
    });
    ui.empty(this.historyRoot);
    this.historyRoot.append(newHistoryBlock);
    return newHistoryBlock;
  }

  /**
   * Looks for {@link supportedExportFormats} members and creates ribbon panel
   * @returns The HTMLElements of ribbonPanels
   * @stability Stable
 */
  buildRibbonPanels(): HTMLElement[][] {
    const newRibbonPanels = [
      ...this.getRibbonPanels(),
      [...(this.exportConfig && this.exportConfig.supportedFormats.length > 0) ? [ui.divH([
        ui.comboPopup(
          ui.iconFA('arrow-to-bottom'),
          this.exportConfig.supportedFormats,
          async (format: string) => DG.Utils.download(this.exportConfig!.filename(format), await this.exportConfig!.export(format))),
      ])]: []]
    ];
    this.setRibbonPanels(newRibbonPanels);
    return newRibbonPanels;
  }

  /**
   * Override to create a custom ribbon menu on the top.
   * @stability Stable
 */
  public buildRibbonMenu() {

  }

  public async onBeforeUnpinRun(callToPin: DG.FuncCall) { }

  public async onAfterUnpinRun(pinnedCall: DG.FuncCall) { }

  /**
   * Saves the run as usual run
   * @param callToPin FuncCall object to save
   * @returns Saved FuncCall
   * @stability Experimental
 */
  public async unpinRun(callToPin: DG.FuncCall): Promise<DG.FuncCall> {
    callToPin.options['isPinned'] = false;
    await this.onBeforeUnpinRun(callToPin);
    const pinnedSave = await grok.dapi.functions.calls.save(callToPin);
    await this.onAfterUnpinRun(pinnedSave);
    return pinnedSave;
  }

  public async onBeforePinRun(callToPin: DG.FuncCall) { }

  public async onAfterPinRun(pinnedCall: DG.FuncCall) { }

  /**
   * Saves the run as favorite
   * @param callToPin FuncCall object to save
   * @returns Saved FuncCall
   * @stability Experimental
 */
  public async pinRun(callToPin: DG.FuncCall): Promise<DG.FuncCall> {
    callToPin.options['isPinned'] = true;
    await this.onBeforePinRun(callToPin);
    const pinnedSave = await grok.dapi.functions.calls.save(callToPin);
    await this.onAfterPinRun(pinnedSave);
    return pinnedSave;
  }

  public async onBeforeSaveRun(callToSave: DG.FuncCall) { }

  public async onAfterSaveRun(savedCall: DG.FuncCall) { }

  /**
   * Saves the computation results to the historical results, returns its id. See also {@link loadRun}.
   * @param callToSave FuncCall object to save
   * @returns Saved FuncCall
   * @stability Experimental
 */
  public async saveRun(callToSave: DG.FuncCall): Promise<DG.FuncCall> {
    await this.onBeforeSaveRun(callToSave);
    const savedCall = await grok.dapi.functions.calls.save(callToSave);
    await this.onAfterSaveRun(savedCall);
    return savedCall;
  }

  public async onBeforeDeleteRun(callToDelete: DG.FuncCall) { }

  public async onAfterDeleteRun(deletedCall: DG.FuncCall) { }

  /**
   * Deleters the computation results to the historical results, returns its id. See also {@link loadRun}.
   * @param callToDelete FuncCall object to delete
   * @returns ID of deleted historical run
   * @stability Experimental
 */
  public async deleteRun(callToDelete: DG.FuncCall): Promise<string> {
    await this.onBeforeDeleteRun(callToDelete);
    await grok.dapi.functions.calls.delete(callToDelete);
    await this.onAfterDeleteRun(callToDelete);
    return callToDelete.id;
  }

  /**
   * Called before fetching the historical run data in {@link loadRun}.
   * @stability Experimental
 */
  public async onBeforeLoadRun() {}

  /**
   * Called after fetching the historical run data in {@link loadRun}.
   * @param funcCall FuncCall fetched from server during {@link loadRun}
   * @stability Experimental
 */
  public async onAfterLoadRun(funcCall: DG.FuncCall) {}

  /**
   * Loads the specified historical run. See also {@link saveRun}.
   * @param funcCallId ID of FuncCall to look for. Get it using {@link funcCall.id} field
   * @returns FuncCall augemented with inputs' and outputs' values
   * @stability Experimental
 */
  public async loadRun(funcCallId: string): Promise<DG.FuncCall> {
    await this.onBeforeLoadRun();
    const pulledRun = await grok.dapi.functions.calls.include('inputs, outputs').find(funcCallId);
    pulledRun.options['isHistorical'] = true;
    console.log('pulledRun: ', pulledRun);
    await this.onAfterLoadRun(pulledRun);
    return pulledRun;
  }

  /**
   * Loads all the function call of this function.
   * Designed to pull hstorical runs in fast manner and the call {@link loadRun} with specified run ID.
   * WARNING: FuncCall inputs/outputs fields are not included
   * @param funcId ID of Func which calls we are looking for. Get it using {@link func.id} field
   * @returns Promise on array of FuncCalls corresponding to the passed Func ID
   * @stability Experimental
 */
  public async pullRuns(funcId: string): Promise<DG.FuncCall[]> {
    const filter = grok.dapi.functions.calls.filter(`func.id="${funcId}"`).include('session.user, options');
    const list = filter.list({pageSize: 20});
    return list;
  }

  public async run(): Promise<void> {
    if (!this.funcCall) throw new Error('The correspoding function is not specified');

    try {
      this.lastCall = this.funcCall.clone();
      this.lastCall.newId();
      await this.lastCall.call(true, undefined, {processed: true}); // mutates the lastCall field
      await this.saveRun(this.lastCall);
    } catch (e) {

    }

    this.outputParametersToView(this.lastCall!);
  }

  protected defaultExportFilename = (format: string) => {
    return `${this.name} - ${new Date().toLocaleString()}.${this.exportConfig!.supportedExtensions[format]}`;
  };

  protected defaultSupportedExportExtensions = () => {
    return {
      'Excel': 'xlsx'
    };
  };

  protected defaultSupportedExportFormats = () => {
    return ['Excel'];
  };

  protected defaultExport = async (format: string) => {
    const lastCall = this.lastCall;
    if (!lastCall) throw new Error(`Function was not called`);

    if (!this.exportConfig!.supportedFormats.includes(format)) throw new Error(`Format "${format}" is not supported.`);

    if (!this.func) throw new Error('The correspoding function is not specified');

    const BLOB_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const exportWorkbook = new ExcelJS.Workbook();

    const isScalarType = (type: DG.TYPE) => (DG.TYPES_SCALAR.has(type));

    const isDataFrame = (type: DG.TYPE) => (type === DG.TYPE.DATA_FRAME);

    const dfInputs = this.func.inputs.filter((input) => isDataFrame(input.propertyType));
    const scalarInputs = this.func.inputs.filter((input) => isScalarType(input.propertyType));
    const dfOutputs = this.func.outputs.filter((output) => isDataFrame(output.propertyType));
    const scalarOutputs = this.func.outputs.filter((output) => isScalarType(output.propertyType));

    const inputParams = [...lastCall.inputParams.values()] as DG.FuncCallParam[];
    const outputParams = [...lastCall.outputParams.values()] as DG.FuncCallParam[];

    dfInputs.forEach((dfInput) => {
      const visibleTitle = dfInput.options.caption || dfInput.name;
      const currentDfSheet = exportWorkbook.addWorksheet(getSheetName(visibleTitle, DIRECTION.INPUT));

      const currentDf = (lastCall.inputs[dfInput.name] as DG.DataFrame);
      dfToSheet(currentDfSheet, currentDf);
    });

    if (scalarInputs.length) {
      const inputScalarsSheet = exportWorkbook.addWorksheet('Input scalars');
      scalarsToSheet(inputScalarsSheet, scalarInputs.map((scalarInput) => ({
        caption: scalarInput.options['caption'] || scalarInput.name,
        value: lastCall.inputs[scalarInput.name],
        units: scalarInput.options['units'] || '',
      })));
    }

    dfOutputs.forEach((dfOutput) => {
      const visibleTitle = dfOutput.options.caption || dfOutput.name;
      const currentDfSheet = exportWorkbook.addWorksheet(getSheetName(visibleTitle, DIRECTION.OUTPUT));

      const currentDf = (lastCall.outputs[dfOutput.name] as DG.DataFrame);
      dfToSheet(currentDfSheet, currentDf);
    });


    if (scalarOutputs.length) {
      const outputScalarsSheet = exportWorkbook.addWorksheet('Output scalars');
      scalarsToSheet(outputScalarsSheet, scalarOutputs.map((scalarOutput) => ({
        caption: scalarOutput.options['caption'] || scalarOutput.name,
        value: lastCall.outputs[scalarOutput.name],
        units: scalarOutput.options['units'] || '',
      })));
    }

    const tabControl = this.resultsTabControl;
    if (tabControl) {
      for (const tabLabel of this.tabsLabels) {
        tabControl.currentPane = tabControl.getPane(tabLabel);
        await new Promise((r) => setTimeout(r, 100));
        if (tabLabel === 'Input') {
          for (const inputParam of inputParams.filter((inputParam) => inputParam.property.propertyType === DG.TYPE.DATA_FRAME)) {
            const nonGridViewers = (inputParam.aux['viewers'] as DG.Viewer[]).filter((viewer) => viewer.type !== DG.VIEWER.GRID);

            const dfInput = dfInputs.find((input) => input.name === inputParam.name);
            const visibleTitle = dfInput!.options.caption || inputParam.name;
            const currentDf = (lastCall.inputs[dfInput!.name] as DG.DataFrame);

            for (const [index, viewer] of nonGridViewers.entries()) {
              if (viewer.root.parentElement?.style.display === 'none') {
                this.paramGridSwitches.get(inputParam.name)?.click();
                await new Promise((r) => setTimeout(r, 50));
              }

              await plotToSheet(
                exportWorkbook,
                exportWorkbook.getWorksheet(getSheetName(visibleTitle, DIRECTION.INPUT)),
                viewer.root,
                currentDf.columns.length + 2,
                (index > 0) ? Math.ceil(nonGridViewers[index-1].root.clientHeight / 20) + 1 : 0
              );
            };
          }
        } else {
          for (const outputParam of outputParams.filter((outputParam) => outputParam.property.propertyType === DG.TYPE.DATA_FRAME && outputParam.property.category === tabLabel)) {
            const nonGridViewers = (outputParam.aux['viewers'] as DG.Viewer[]).filter((viewer) => viewer.type !== DG.VIEWER.GRID);

            const dfOutput = dfOutputs.find((input) => input.name === outputParam.name);
            const visibleTitle = dfOutput!.options.caption || outputParam.name;
            const currentDf = (lastCall.outputs[dfOutput!.name] as DG.DataFrame);

            for (const [index, viewer] of nonGridViewers.entries()) {
              if (viewer.root.parentElement?.style.display === 'none') {
                this.paramGridSwitches.get(outputParam.name)?.click();
                await new Promise((r) => setTimeout(r, 50));
              }

              await plotToSheet(
                exportWorkbook,
                exportWorkbook.getWorksheet(getSheetName(visibleTitle, DIRECTION.OUTPUT)),
                viewer.root,
                currentDf.columns.length + 2,
                (index > 0) ? Math.ceil(nonGridViewers[index-1].root.clientHeight / 20) + 1 : 0
              );
            }
          };
        }
      };
    }
    const buffer = await exportWorkbook.xlsx.writeBuffer();

    return new Blob([buffer], {type: BLOB_TYPE});
  };

  protected get isInputPanelRequired() {
    return this.func?.inputs.some((p) => p.propertyType == DG.TYPE.DATA_FRAME && p.options['viewer'] != null) || false;
  }

  protected get outParamCategories() {
    return [
      ...new Set(this.func!.outputs.map((p) => p.category)) // get all output params' categories
    ]; // keep only unique of them
  }

  protected get outputTabsLabels() {
    return [
      ...this.outParamCategories,
      ...this.outParamCategories.find((val) => val === 'Misc') ? ['Output'] : [], // if no categories are stated, the default category is added
    ];
  }

  protected get tabsLabels() {
    return Object.keys(this.paramToCategoryMap);
  }

  protected get paramToCategoryMap() {
    const map = {} as Record<string, string[]>;
    if (this.isInputPanelRequired)
      this.func!.inputs.forEach((p) => map['Input'] ? map['Input'].push(p.name): map['Input'] = [p.name]);

    this.func!.outputs.forEach((p) => map[p.category === 'Misc' ? 'Output': p.category] ? map[p.category === 'Misc' ? 'Output': p.category].push(p.name) : map[p.category === 'Misc' ? 'Output': p.category] = [p.name]);

    return map;
  }


  protected renderRunSection(call: DG.FuncCall): HTMLElement {
    return ui.wait(async () => {
      const runButton = ui.bigButton('Run', async () => {
        call.aux['view'] = this.dart;
        await this.run();
      });
      const editor = ui.div();
      const inputs: DG.InputBase[] = await call.buildEditor(editor, {condensed: true});
      editor.classList.add('ui-form');
      const buttons = ui.divH([this.historyRoot, runButton], {style: {'justify-content': 'space-between'}});
      editor.appendChild(buttons);
      return editor;
    });
  }

  private clearResults(switchToOutput: boolean = true) {
    const categories = this.tabsLabels;

    if ((categories.length > 1 || (categories.length == 1 && categories[0] != 'Misc'))) {
      this.resultsTabControl = DG.TabControl.create();
      for (const c of categories) {
        if (!this.resultTabs.has(c))
          this.resultTabs.set(c, ui.div([], 'ui-panel, grok-func-results, ui-box'));
        let name = c;
        if (this.isInputPanelRequired && categories.length == 2 && c == 'Misc')
          name = 'OUTPUT';
        this.resultsTabControl.addPane(name, () => this.resultTabs.get(c) ?? ui.div());
      }
      if (categories.length > 1 && this.isInputPanelRequired && switchToOutput)
        this.resultsTabControl.currentPane = this.resultsTabControl.panes[1];
      this.resultsDiv = this.resultsTabControl.root;
    }
  }

  private outputParametersToView(call: DG.FuncCall): void {
    this.clearResults(true);
    for (const p of call.outputParams.values() as DG.FuncCallParam[]) {
      p.processOutput();
      if (p.property.propertyType == DG.TYPE.DATA_FRAME && p.value != null)
        this.appendOutputDf(p, {caption: p.property.name, category: p.property.category});
      else this.appendResultScalar(p, {caption: p.property.name, category: p.property.category});
    }
    this.buildOutputBlock();
  }

  // mappping of param to the switchces of their viewers/grids
  private paramGridSwitches: Map<string, HTMLElement> = new Map();
  // mappping of param to their viewers placed on DOM
  private existingParamViewers: Map<string, DG.Viewer[]> = new Map();
  // mappping of param to their html elements
  private paramSpans: Map<string, HTMLElement> = new Map();
  // mappping of tab names to their content
  private resultTabs: Map<String, HTMLElement> = new Map();
  private resultsTabControl: DG.TabControl | undefined;
  private resultsDiv: HTMLElement = ui.panel([], 'grok-func-results');

  protected controlsRoot: HTMLDivElement = ui.box(null, {style: {maxWidth: '370px'}});
  protected resultsRoot: HTMLDivElement = ui.box();
  protected historyRoot: HTMLDivElement = ui.divV([], {style: {'justify-content': 'center'}});
  protected inputsRoot: HTMLDivElement = ui.panel([], 'grok-func-results, ui-box');

  private appendOutputDf(param: DG.FuncCallParam, options?: { caption?: string, category?: string, height?: number }) {
    const paramDf = param.value as DG.DataFrame;
    const height = options?.height ?? 400;
    const paramViewers: DG.Viewer[] = param.aux['viewers'] ?? []; // storing the viewers of Df
    const paramCaption = options?.caption ?? param.aux['viewerTitle'] ?? param.property.caption ?? '';
    let existingViewers = this.existingParamViewers.get(param.name);
    if (existingViewers != null) {
      for (const v of existingViewers)
        v.dataFrame = paramDf;

      return;
    }
    existingViewers ??= [];
    this.existingParamViewers.set(param.name, existingViewers);
    if (paramViewers.length == 0)
      paramViewers.push(paramDf.plot.grid());

    const viewersToHide: HTMLElement[] = [];
    let blocks: number = 0;
    let blockWidth: number = 0;
    const gridWrapper = ui.box(null, {style: {height: '100%'}});

    const isGridSwitchable = wu(paramViewers).every((v: DG.Viewer) => v.type !== 'Grid');
    $(gridWrapper).hide();

    const getHeader = () => {
      const headerLabel = paramCaption ?? paramDf.name ?? '';
      const header = ui.div([], 'grok-func-results-header');
      if (headerLabel != '') {
        const h = ui.h1(headerLabel);
        ui.Tooltip.bind(h, () => headerLabel);
        header.appendChild(h);
      }
      if (isGridSwitchable) {
        const icon = ui.iconSvg('table', (e) => {
          e.stopPropagation();
          ui.setDisplayAll(viewersToHide, viewersToHide.some((viewer) => viewer.style.display === 'none'));
          ui.setDisplay(gridWrapper, gridWrapper.style.display === 'none');
        }, 'Show grid');
        header.appendChild(icon);
        this.paramGridSwitches.set(param.name, icon);
      }
      if (!grok.shell.tables.includes(paramDf)) {
        header.appendChild(
          ui.icons.add((e: any) => {
            e.stopPropagation();
            const v = grok.shell.addTableView(paramDf);
            (async () => {
              for (const viewer of paramViewers) {
                if (viewer.type != 'Grid') {
                  const newViewer = await paramDf.plot.fromType(viewer.type) as DG.Viewer;
                  newViewer.setOptions(viewer.getOptions());
                  v.addViewer(newViewer);
                }
              }
            })();
          },
          'Add to workspace'
          ));
      }
      return header;
    };

    if (isGridSwitchable) {
      const grid = paramDf.plot.grid();
      gridWrapper.appendChild(grid.root);
      existingViewers.push(grid);
    }

    const header = getHeader();
    const wrapper = ui.divH([], {style: {height: '100%'}});
    paramViewers.forEach((viewer) => {
      if (viewer?.tags == null)
        return;
      existingViewers!.push(viewer);
      const viewerSize = viewer.tags['.block-size'] ?? 100; // getting `(block: 25)` value; if not defined, it is 100

      viewer.root.style.height = '100%';
      viewer.root.classList.add(`ui-block-${viewerSize}`);
      if (blocks + viewerSize <= 100) {
        viewersToHide.push(wrapper);
        blockWidth += viewerSize;
      }
      blocks += viewerSize;
      wrapper.appendChild(viewer.root);
    });

    const block = ui.divV([header, wrapper, gridWrapper], {style: {height: `${height}px`, width: `${blockWidth}%`}});
    block.classList.add('ui-box');
    this.appendResultElement(block, options?.category);
  }

  private appendResultScalar(param: DG.FuncCallParam, options: { caption?: string, category: string, height?: number }) {
    const span = ui.span([`${options.caption ?? param.name}: `, `${param.value}`]);
    if (!this.paramSpans.get(param.name)) {
      if (this.resultsTabControl)
        this.resultTabs.get(options.category)!.appendChild(span);
      else
        this.resultsDiv.appendChild(span);
    } else {
      this.paramSpans.get(param.name)?.replaceWith(span);
    }
    this.paramSpans.set(param.name, span);
  }

  private appendResultElement(d: HTMLElement, category?: string) {
    if (category != null && this.resultsTabControl != undefined && this.resultTabs.get(category) != null)
      this.resultTabs.get(category)!.appendChild(d);
    else
      this.resultsDiv.appendChild(d);
  }
}

const getSheetName = (name: string, direction: DIRECTION) => {
  const idealName = `${direction} - ${name}`;
  return (idealName.length > 31) ? name.substring(0, 32) : idealName;
};

enum DIRECTION {
  INPUT = 'Input',
  OUTPUT = 'Output'
}

const scalarsToSheet = (sheet: ExcelJS.Worksheet, scalars: { caption: string, value: string, units: string }[]) => {
  sheet.addRow(['Parameter', 'Value', 'Units']).font = {bold: true};
  scalars.forEach((scalar) => {
    sheet.addRow([scalar.caption, scalar.value, scalar.units]);
  });

  sheet.getColumn(1).width = Math.max(
    ...scalars.map((scalar) => scalar.caption.toString().length), 'Parameter'.length
  ) * 1.2;
  sheet.getColumn(2).width = Math.max(...scalars.map((scalar) => scalar.value.toString().length), 'Value'.length) * 1.2;
  sheet.getColumn(3).width = Math.max(...scalars.map((scalar) => scalar.units.toString().length), 'Units'.length) * 1.2;
};

const dfToSheet = (sheet: ExcelJS.Worksheet, df: DG.DataFrame) => {
  console.log(df);
  sheet.addRow(df.columns.names()).font = {bold: true};
  for (let i = 0; i < df.rowCount; i++)
    sheet.addRow([...df.row(i).cells].map((cell: DG.Cell) => cell.value));

  for (let i = 0; i < df.columns.length; i++) {
    sheet.getColumn(i + 1).width =
      Math.max(
        ...df.columns.byIndex(i).categories.map((category) => category.toString().length),
        df.columns.byIndex(i).name.length
      ) * 1.2;
  }
};

const plotToSheet = async (exportWb: ExcelJS.Workbook, sheet: ExcelJS.Worksheet, plot: HTMLElement, columnForImage: number, rowForImage: number = 0) => {
  const canvas = await html2canvas(plot as HTMLElement, {logging: false});
  const dataUrl = canvas.toDataURL('image/png');

  const imageId = exportWb.addImage({
    base64: dataUrl,
    extension: 'png',
  });
  sheet.addImage(imageId, {
    tl: {col: columnForImage, row: rowForImage},
    ext: {width: canvas.width, height: canvas.height},
  });
};
