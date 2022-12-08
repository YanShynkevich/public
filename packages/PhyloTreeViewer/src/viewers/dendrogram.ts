import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import * as bio from '@datagrok-libraries/bio';
import wu from 'wu';

import * as rxjs from 'rxjs';
import {JsViewer} from 'datagrok-api/dg';
import {Subject, Unsubscribable} from 'rxjs';
import {TREE_TAGS} from '../consts';
import {ITreeStyler, markupNode, MarkupNodeType} from './tree-renderers/markup';
import {LeafRangeGridTreeRenderer} from './tree-renderers/grid-tree-renderer';
import {CanvasTreeRenderer, ITreePlacer} from './tree-renderers/canvas-tree-renderer';
import {TreeRendererBase} from './tree-renderers/tree-renderer-base';
import {line} from 'd3';

export enum PROPS_CATS {
  APPEARANCE = 'Appearance',
  BEHAVIOR = 'Behavior',
  LAYOUT = 'Layout',
  DATA = 'Data',
}

export enum PROPS {
  lineWidth = 'lineWidth',
  nodeSize = 'nodeSize',
  strokeColor = 'strokeColor',
  fillColor = 'fillColor',
  font = 'font',

  showGrid = 'showGrid',
  showLabels = 'showLabels',

  firstLeaf = 'firstLeaf',
  step = 'step',
  stepZoom = 'stepZoom',

  newick = 'newick',
}

class DendrogramTreePlacer implements ITreePlacer {
  private _top: number;
  get top(): number { return this._top; }

  private _bottom: number;
  get bottom() { return this._bottom;}

  get height() { return this._bottom - this._top; }

  get padding() { return {left: 8, right: 8,};}

  private readonly _onChanged: rxjs.Subject<void>;

  get onPlacingChanged(): rxjs.Observable<void> { return this._onChanged; }

  constructor(top: number, bottom: number) {
    this._top = top;
    this._bottom = bottom;

    this._onChanged = new Subject<void>();
  }

  update(params: { top?: number; bottom?: number }): void {
    let changed: boolean = false;

    if (params.top && params.top != this.top) {
      this._top = params.top;
      changed = true;
    }

    if (params.bottom && params.bottom != this.bottom) {
      this._bottom = params.bottom;
      changed = true;
    }

    if (changed)
      this._onChanged.next();
  }
}

class DendrogramTreeStyler implements ITreeStyler {

  private _lineWidth: number;
  get lineWidth(): number { return this._lineWidth; }

  set lineWidth(value: number) {
    this._lineWidth = value;
    this._onStylingChanged.next();
  }

  private _nodeSize: number;
  get nodeSize(): number { return this._nodeSize; }

  set nodeSize(value: number) {
    this._nodeSize = value;
    this._onStylingChanged.next();
  }

  private _showGrid: boolean;
  get showGrid(): boolean { return this._showGrid; }

  set showGrid(value: boolean) {
    this._showGrid = value;
    this._onStylingChanged.next();
  }

  private _strokeColor: string;
  get strokeColor(): string { return this._strokeColor; }

  set strokeColor(value: string) {
    this._strokeColor = value;
    this._onStylingChanged.next();
  }

  private _fillColor: string;
  get fillColor(): string { return this._fillColor; }

  set fillColor(value: string) {
    this._fillColor = value;
    this._onStylingChanged.next();
  }

  private _onStylingChanged = new Subject<void>();

  get onStylingChanged(): rxjs.Observable<void> { return this._onStylingChanged; }

  constructor(lineWidth: number, nodeSize: number, showGrid: boolean, strokeColor: string, fillColor: string) {
    this._lineWidth = lineWidth;
    this._nodeSize = nodeSize;
    this._showGrid = showGrid;
    this._strokeColor = strokeColor;
    this._fillColor = fillColor;
  }
}


export class Dendrogram extends DG.JsViewer {
  private viewed: boolean = false;

  [PROPS.lineWidth]: number;

  [PROPS.nodeSize]: number;

  [PROPS.showGrid]: boolean;

  [PROPS.strokeColor]: number;

  [PROPS.fillColor]: number;

  [PROPS.font]: string;

  [PROPS.showLabels]: boolean;

  [PROPS.firstLeaf]: number;
  [PROPS.step]: number;
  [PROPS.stepZoom]: number;

  styler: DendrogramTreeStyler;

  constructor() {
    super();

    // ITreeStyler

    this.lineWidth = this.float(PROPS.lineWidth, 1,
      {category: PROPS_CATS.APPEARANCE, editor: 'slider', min: 0, max: 16, step: 0.1});
    this.nodeSize = this.float(PROPS.nodeSize, 3,
      {category: PROPS_CATS.APPEARANCE, editor: 'slider', min: 0, max: 16, step: 0.1});

    this.showGrid = this.bool(PROPS.showGrid, false, {category: PROPS_CATS.APPEARANCE,});

    this.strokeColor = this.int(PROPS.strokeColor, 0x222222, {category: PROPS_CATS.APPEARANCE});
    this.fillColor = this.int(PROPS.fillColor, 0x333333, {category: PROPS_CATS.APPEARANCE,});


    this.showLabels = this.bool(PROPS.showLabels, false, {category: PROPS_CATS.APPEARANCE});

    this.font = this.string(PROPS.font, 'monospace 10pt', {category: PROPS_CATS.APPEARANCE});

    this.stepZoom = this.float(PROPS.stepZoom, 0,
      {category: PROPS_CATS.BEHAVIOR, editor: 'slider', min: -4, max: 4, step: 0.1});

    this.step = this.float('step', 28,
      {category: PROPS_CATS.APPEARANCE, editor: 'slider', min: 0, max: 64, step: 0.1});

    // data, not userEditable option is not displayed in Property panel, but can be set through setOptions()
    this.newick = this.string('newick', ';',
      {category: PROPS_CATS.DATA, userEditable: false});

    this.styler = new DendrogramTreeStyler(
      this.lineWidth, this.nodeSize, this.showGrid,
      `#${(this.strokeColor & 0xFFFFFF).toString(16).padStart(6, '0')}`,
      `#${(this.fillColor & 0xFFFFFF).toString(16).padStart(6, '0')}`);
  }

  private _nwkDf: DG.DataFrame;

  public get nwkDf(): DG.DataFrame {
    return this._nwkDf;
  }

  public set nwkDf(value: DG.DataFrame) {
    console.debug('PhyloTreeViewer: PhylocanvasGlViewer.onTableAttached() ' +
      `this.dataFrame = ${!this.nwkDf ? 'null' : 'value'} )`);

    if (this.viewed) {
      this.destroyView();
      this.viewed = false;
    }

    this._nwkDf = value;
    // TODO: Logic to get newick
    this.newick = this.nwkDf.getTag(TREE_TAGS.NEWICK) ?? '';

    if (!this.viewed) {
      this.buildView();
      this.viewed = true;
    }
  }

  private _newick: string;

  public get newick(): string { return this._newick; }

  public set newick(value: string) {
    this._newick = value;
    if (this.renderer) {
      const treeRoot = bio.Newick.parse_newick(this._newick);
      markupNode(treeRoot);
      this.renderer!.treeRoot = treeRoot;
    }
  }

  override onTableAttached() {
    super.onTableAttached();
    console.debug('PhyloTreeViewer: PhylocanvasGlViewer.onTableAttached() ' +
      `this.dataFrame = ${!this.dataFrame ? 'null' : 'value'} )`);

    if (this.viewed) {
      this.destroyView();
      this.viewed = false;
    }

    // TODO: Logic to get newick
    this.newick = this.dataFrame.getTag(TREE_TAGS.NEWICK) ?? '';

    if (!this.viewed) {
      this.buildView();
      this.viewed = true;
    }
  }

  override detach() {
    if (this.viewed) {
      this.destroyView();
      this.viewed = false;
    }

    super.detach();
  }

  override onPropertyChanged(property: DG.Property | null) {
    super.onPropertyChanged(property);

    if (!property) {
      console.warn('PhyloTreeViewer: PhylocanvasGlViewer.onPropertyChanged() No property value');
      return;
    }

    switch (property.name) {
    case 'newick':
      if (this.viewed) {
        this.destroyView();
        this.viewed = true;
      }

      if (this.viewed) {
        this.viewed = false;
        this.buildView();
      }
      break;

    case PROPS.lineWidth:
      this.styler.lineWidth = this.lineWidth;
      break;

    case PROPS.nodeSize:
      this.styler.nodeSize = this.nodeSize;
      break;

    case PROPS.showGrid:
      this.styler.showGrid = this.showGrid;
      break;

    case PROPS.strokeColor:
      this.styler.strokeColor = `#${(this.strokeColor & 0xFFFFFF).toString(16).padStart(6, '0')}`;
      break;

    case PROPS.fillColor:
      this.styler.fillColor = `#${(this.fillColor & 0xFFFFFF).toString(16).padStart(6, '0')}`;
      break;

    case PROPS.font:
      break;
    }
  }

  // -- View --

  private viewSubs: Unsubscribable[] = [];

  private treeDiv?: HTMLDivElement;
  private renderer?: TreeRendererBase<MarkupNodeType>;

  private destroyView(): void {
    console.debug('PhyloTreeViewer: Dendrogram.destroyView()');

    delete this.renderer;
    delete this.treeDiv;
    for (const sub of this.viewSubs) sub.unsubscribe();
    this.viewSubs = [];
  }

  private buildView(): void {
    console.debug('PhyloTreeViewer: Dendrogram.buildView()');

    this.treeDiv = ui.div([], {
      style: {
        width: `${this.root.clientWidth}px`,
        height: `${this.root.clientHeight}px`,
        backgroundColor: '#A0A0FF',
      }
    });
    this.treeDiv.style.setProperty('overflow', 'hidden', 'important');
    this.root.appendChild(this.treeDiv);

    const treeRoot: MarkupNodeType = bio.Newick.parse_newick(this.newick);
    markupNode(treeRoot);
    const totalLength: number = treeRoot.subtreeLength!;
    const placer = new DendrogramTreePlacer(treeRoot.minIndex - 0.5, treeRoot.maxIndex + 0.5);
    this.renderer = new CanvasTreeRenderer(treeRoot, totalLength, this.treeDiv, placer, this.styler);

    this.viewSubs.push(
      ui.onSizeChanged(this.root).subscribe(this.rootOnSizeChanged.bind(this)));
  }

  // -- Handle controls events --

  private rootOnSizeChanged() {
    console.debug('PhyloTreeViewer: Dendrogram.rootOnSizeChanged()');

    this.treeDiv!.style.width = `${this.root.clientWidth}px`;
    this.treeDiv!.style.height = `${this.root.clientHeight}px`;
  }
}

export class MyViewer extends DG.JsViewer {
  prop1: number;
  propMax: number;

  constructor() {
    super();

    this.prop1 = this.float('prop1', 1,
      {category: 'cat', editor: 'slider', min: 0, max: 64, step: 0.1});
    this.propMax = this.float('propMax', 16);
  }

  onPropertyChanged(property: DG.Property | null) {
    super.onPropertyChanged(property);

    if (property) {
      switch (property.name) {
      case 'propMax':
        //this.props.get('prop1');
        this.props.getProperty('prop1').options.max = this.propMax;
        break;
      default:
        throw new Error('Unhandled property changed \'${}\'.');
      }
    }
  }

  /*
  //name: Template
  //description: Hello world script
  //language: javascript

  const tv = grok.shell.tableView('Table');
  const v1 = await tv.dataFrame.plot.fromType('MyViewer', {});

  alert(v1);

  tv.dockManager.dock(v1, 'right');
  */
}
