import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import wu from 'wu';

import * as rxjs from 'rxjs';
import {Subject, Unsubscribable} from 'rxjs';
import {JsViewer} from 'datagrok-api/dg';
import {TREE_TAGS} from '../consts';
import {ITreeStyler, markupNode, MarkupNodeType} from './tree-renderers/markup';
import {LeafRangeGridTreeRenderer} from './tree-renderers/grid-tree-renderer';
import {CanvasTreeRenderer} from './tree-renderers/canvas-tree-renderer';
import {TreeRendererBase} from './tree-renderers/tree-renderer-base';
import {ITreeHelper, Newick, NodeType} from '@datagrok-libraries/bio';
import {RectangleTreeHoverType, RectangleTreePlacer} from './tree-renderers/rectangle-tree-placer';
import {TreeHelper} from '../utils/tree-helper';
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

  // -- Data --
  newick = 'newick',
  newickTag = 'newickTag',
  nodeColumnName = 'nodeColumnName',
  colorColumnName = 'colorColumnName',
  colorAggrType = 'colorAggrType',
}

class DendrogramTreePlacer extends RectangleTreePlacer {

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

const newickDefault: string = ';';

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

  // -- Data --
  [PROPS.newick]: string;
  [PROPS.newickTag]: string;
  [PROPS.nodeColumnName]: string;
  [PROPS.colorColumnName]: string;
  [PROPS.colorAggrType]: string;

  styler: DendrogramTreeStyler;
  highlightStyler: DendrogramTreeStyler;
  selectionStyler: DendrogramTreeStyler;

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

    this.step = this.float(PROPS.step, 28,
      {category: PROPS_CATS.APPEARANCE, editor: 'slider', min: 0, max: 64, step: 0.1});

    // -- Data --, not userEditable option is not displayed in Property panel, but can be set through setOptions()
    this.newick = this.string(PROPS.newick, newickDefault,
      {category: PROPS_CATS.DATA/*, userEditable: false*/});
    this.newickTag = this.string(PROPS.newickTag, null,
      {category: PROPS_CATS.DATA, choices: []});
    this.nodeColumnName = this.string(PROPS.nodeColumnName, null,
      {category: PROPS_CATS.DATA});
    this.colorColumnName = this.string(PROPS.colorColumnName, null,
      {category: PROPS_CATS.DATA});
    this.colorAggrType = this.string(PROPS.colorAggrType, null,
      {category: PROPS_CATS.DATA, choices: [DG.AGG.AVG, DG.AGG.MIN, DG.AGG.MAX, DG.AGG.MED, DG.AGG.TOTAL_COUNT]});

    this.styler = new DendrogramTreeStyler(
      this.lineWidth, this.nodeSize, this.showGrid,
      `#${(this.strokeColor & 0xFFFFFF).toString(16).padStart(6, '0')}`,
      `#${(this.fillColor & 0xFFFFFF).toString(16).padStart(6, '0')}`);
    this.highlightStyler = new DendrogramTreeStyler(
      this.getHighlightStylerLineWidth(), this.getHighlightStylerNodeSize(),
      false, '#FFFF00C0', '#FFFF00C0');

    this.selectionStyler = new DendrogramTreeStyler(
      this.getSelectionStylerLineWidth(), this.getSelectionStylerNodeSize(),
      false, '#80FF80C0', '#88FF88C0');
  }

  // private _nwkDf: DG.DataFrame;
  //
  // public get nwkDf(): DG.DataFrame {
  //   return this._nwkDf;
  // }
  //
  // public set nwkDf(value: DG.DataFrame) {
  //   console.debug('PhyloTreeViewer: PhylocanvasGlViewer.onTableAttached() ' +
  //     `this.dataFrame = ${!this.nwkDf ? 'null' : 'value'} )`);
  //
  //   if (this.viewed) {
  //     this.destroyView();
  //     this.viewed = false;
  //   }
  //
  //   this._nwkDf = value;
  //   // TODO: Logic to get newick
  //   this.newick = this.nwkDf.getTag(TREE_TAGS.NEWICK) ?? '';
  //
  //   if (!this.viewed) {
  //     this.buildView();
  //     this.viewed = true;
  //   }
  // }

  private _newick: string;

  // public get newick(): string { return this._newick; }
  //
  // public set newick(value: string) {
  //   this._newick = value;
  //   if (this.renderer) {
  //     const treeRoot = Newick.parse_newick(this._newick);
  //     markupNode(treeRoot);
  //     this.renderer!.treeRoot = treeRoot;
  //   }
  // }

  // effective tree value (to plot)
  private treeNewick: string | null = null;

  override onTableAttached() {
    super.onTableAttached();
    console.debug('PhyloTreeViewer: PhylocanvasGlViewer.onTableAttached() ' +
      `this.dataFrame = ${!this.dataFrame ? 'null' : 'value'} )`);

    // -- Editors --
    // update editors for properties dependent from viewer's dataFrame
    const dfTagNameList = wu<string>(this.dataFrame.tags.keys())
      .filter((t) => t.startsWith('.')).toArray();
    this.props.getProperty(PROPS.newickTag).choices = ['', ...dfTagNameList];

    this.setData();
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

    // Rebuild view
    switch (property.name) {
    case PROPS.newick:
    case PROPS.newickTag:
      this.setData();
      break;
    }
  }

  // -- Data --

  private setData(): void {
    if (this.viewed) {
      this.destroyView();
      this.viewed = false;
    }

    // -- Tree data --
    // Tree newick data source priorities
    // this.newick (property)                  // the highest priority
    // this.dataFrame.getTag(this.newickTag)
    // this.dataFrame.getTag(TREE_TAGS.NEWICK) // the lowest priority
    let newickTag: string = TREE_TAGS.NEWICK;
    if (this.newickTag) newickTag = this.newickTag;
    this.treeNewick = this.dataFrame.getTag(newickTag);
    if (this.newick && this.newick != newickDefault) this.treeNewick = this.newick;

    if (!this.viewed) {
      this.buildView();
      this.viewed = true;
    }
  }

  // -- View --

  private viewSubs: Unsubscribable[] = [];

  private treeDiv?: HTMLDivElement;
  private renderer?: TreeRendererBase<MarkupNodeType>;

  private destroyView(): void {
    console.debug('PhyloTreeViewer: Dendrogram.destroyView()');

    this.renderer!.detach();
    delete this.renderer;
    this.treeDiv!.remove();
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

    const treeRoot: MarkupNodeType = Newick.parse_newick(this.treeNewick);
    markupNode(treeRoot);
    const totalLength: number = treeRoot.subtreeLength!;
    const placer = new DendrogramTreePlacer(treeRoot.minIndex - 0.5, treeRoot.maxIndex + 0.5, totalLength);
    this.renderer = new CanvasTreeRenderer(treeRoot, placer, this.styler, this.highlightStyler, this.selectionStyler);
    this.viewSubs.push(this.renderer.onHoverChanged.subscribe(this.rendererOnHoverChanged.bind(this)));
    this.viewSubs.push(this.renderer.onSelectedChanged.subscribe(this.rendererOnSelectedChanged.bind(this)));
    this.renderer.attach(this.treeDiv);

    this.viewSubs.push(ui.onSizeChanged(this.root).subscribe(this.rootOnSizeChanged.bind(this)));
    this.viewSubs.push(this.styler.onStylingChanged.subscribe(this.stylerOnStylingChanged.bind(this)));
  }

  // -- Handle controls events --

  private rootOnSizeChanged() {
    console.debug('PhyloTreeViewer: Dendrogram.rootOnSizeChanged()');

    this.treeDiv!.style.width = `${this.root.clientWidth}px`;
    this.treeDiv!.style.height = `${this.root.clientHeight}px`;
  }

  private rendererOnHoverChanged() {
    if (!this.renderer) return;

    // if (this.nodeColumnName) {
    //   if (this.renderer!.hoveredNode){
    //     const grid: DG.Grid;
    //     this.dataFrame.
    //   }
    // }
  }

  private rendererOnSelectedChanged() {
    if (!this.renderer) return;

    if (this.renderer.selectedNodes.length == 0) {
      this.dataFrame.selection.init((rowI) => { return false; });
    } else {
      if (this.nodeColumnName) {
        const nodeCol: DG.Column = this.dataFrame.getCol(this.nodeColumnName);
        const th = new TreeHelper();
        const nodeNameSet = new Set(
          this.renderer.selectedNodes
            .map((sn) => th.getNodeList(sn).map((n) => n.name))
            .flat());
        this.dataFrame.selection.init((rowI) => {
          const nodeName = nodeCol.get(rowI);
          return nodeNameSet.has(nodeName);
        });
      }
    }
  }

  private dataFrameOnSelectionChanged(value: any) {
    if (!this.renderer) return;

    // if (this.nodeNameColumn)
    // this.dataFrame.selection
  }

  private stylerOnStylingChanged() {
    this.highlightStyler.lineWidth = this.getHighlightStylerLineWidth();
    this.highlightStyler.nodeSize = this.getHighlightStylerNodeSize();
  }

  getHighlightStylerLineWidth(): number {
    return Math.max(this.styler.lineWidth + 4, this.styler.lineWidth * 1.8);
  }

  getHighlightStylerNodeSize(): number {
    return Math.max(this.styler.nodeSize + 4, this.styler.nodeSize * 1.8);
  }

  getSelectionStylerLineWidth(): number {
    return Math.max(this.styler.lineWidth + 2, this.styler.lineWidth * 1.4);
  }

  getSelectionStylerNodeSize(): number {
    return Math.max(this.styler.nodeSize + 2, this.styler.nodeSize * 1.4);
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
