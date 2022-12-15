import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import wu from 'wu';
import * as rxjs from 'rxjs';

import {Unsubscribable} from 'rxjs';
import {TREE_TAGS} from '../consts';
import {ITreeStyler, markupNode, MarkupNodeType, TreeStylerBase} from './tree-renderers/markup';
import {CanvasTreeRenderer} from './tree-renderers/canvas-tree-renderer';
import {TreeRendererBase} from './tree-renderers/tree-renderer-base';
import {Newick} from '@datagrok-libraries/bio';
import {RectangleTreeHoverType, RectangleTreePlacer} from './tree-renderers/rectangle-tree-placer';
import {TreeHelper} from '../utils/tree-helper';

enum ColorNames {
  Main = 'Main',
  Light = 'Light',
  Selection = 'Selection',
}

const TreeDefaultPalette: { [name: string]: number } = {
  [ColorNames.Main]: DG.Color.categoricalPalette[12],
  [ColorNames.Light]: DG.Color.categoricalPalette[13],
  [ColorNames.Selection]: DG.Color.selectedRows,
};

// Obtained with DG.Color.toRgb(DG.Color.categoricalPalette[12])
const categoricalPaletteList: string[] = [
  'rgb(31,119,180)',
  'rgb(255,187,120)',
  'rgb(44,160,44)',
  'rgb(152,223,138)',
  'rgb(214,39,40)',
  'rgb(255,152,150)',
  'rgb(148,103,189)',
  'rgb(197,176,213)',
  'rgb(140,86,75)',
  'rgb(196,156,148)',
  'rgb(227,119,194)',
  'rgb(247,182,210)',
  'rgb(127,127,127)',
  'rgb(199,199,199)',
  'rgb(188,189,34)',
  'rgb(219,219,141)',
  'rgb(23,190,207)',
  'rgb(158,218,229)'];

export enum PROPS_CATS {
  APPEARANCE = 'Appearance',
  BEHAVIOR = 'Behavior',
  LAYOUT = 'Layout',
  DATA = 'Data',
}

export enum PROPS {
  lineWidth = 'lineWidth',
  nodeSize = 'nodeSize',
  mainStrokeColor = 'mainStrokeColor',
  mainFillColor = 'mainFillColor',
  lightStrokeColor = 'lightStrokeColor',
  lightFillColor = 'lightFillColor',
  selectedStrokeColor = 'selectedStrokeColor',
  selectedFillColor = 'selectedFillColor',

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

class DendrogramTreeStyler extends TreeStylerBase<MarkupNodeType> {

  override get lineWidth(): number { return this._lineWidth; }

  set lineWidth(value: number) {
    this._lineWidth = value;
    this._onStylingChanged.next();
  }

  override get nodeSize(): number { return this._nodeSize; }

  set nodeSize(value: number) {
    this._nodeSize = value;
    this._onStylingChanged.next();
  }

  override get showGrid(): boolean { return this._showGrid; }

  set showGrid(value: boolean) {
    this._showGrid = value;
    this._onStylingChanged.next();
  }

  override get strokeColor(): string { return this._strokeColor; }

  set strokeColor(value: string) {
    this._strokeColor = value;
    this._onStylingChanged.next();
  }

  override get fillColor(): string { return this._fillColor; }

  set fillColor(value: string) {
    this._fillColor = value;
    this._onStylingChanged.next();
  }

  constructor(lineWidth: number, nodeSize: number, showGrid: boolean, strokeColor: string, fillColor: string) {
    super();
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
  [PROPS.mainStrokeColor]: number;
  [PROPS.mainFillColor]: number;
  [PROPS.lightStrokeColor]: number;
  [PROPS.lightFillColor]: number;
  [PROPS.selectedStrokeColor]: number;
  [PROPS.selectedFillColor]: number;

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

  mainStyler: DendrogramTreeStyler;
  lightStyler: DendrogramTreeStyler;
  selectedStyler: DendrogramTreeStyler;

  constructor() {
    super();

    // ITreeStyler

    this.lineWidth = this.float(PROPS.lineWidth, 1,
      {category: PROPS_CATS.APPEARANCE, editor: 'slider', min: 0, max: 16, step: 0.1});
    this.nodeSize = this.float(PROPS.nodeSize, 3,
      {category: PROPS_CATS.APPEARANCE, editor: 'slider', min: 0, max: 16, step: 0.1});

    this.showGrid = this.bool(PROPS.showGrid, false, {category: PROPS_CATS.APPEARANCE,});

    this.mainStrokeColor = this.int(PROPS.mainStrokeColor, TreeDefaultPalette[ColorNames.Main],
      {category: PROPS_CATS.APPEARANCE});
    this.mainFillColor = this.int(PROPS.mainFillColor, TreeDefaultPalette[ColorNames.Main],
      {category: PROPS_CATS.APPEARANCE,});

    this.lightStrokeColor = this.int(PROPS.lightStrokeColor, TreeDefaultPalette[ColorNames.Light],
      {category: PROPS_CATS.APPEARANCE});
    this.lightFillColor = this.int(PROPS.lightFillColor, TreeDefaultPalette[ColorNames.Light],
      {category: PROPS_CATS.APPEARANCE});

    this.selectedStrokeColor = this.int(PROPS.selectedStrokeColor, TreeDefaultPalette[ColorNames.Selection],
      {category: PROPS_CATS.APPEARANCE});
    this.selectedFillColor = this.int(PROPS.selectedFillColor, TreeDefaultPalette[ColorNames.Selection],
      {category: PROPS_CATS.APPEARANCE});

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

    this.mainStyler = new DendrogramTreeStyler(
      this.lineWidth, this.nodeSize, this.showGrid,
      DG.Color.toRgb(this.mainStrokeColor) /* `#${(this.strokeColor & 0xFFFFFF).toString(16).padStart(6, '0')}`*/,
      DG.Color.toRgb(this.mainFillColor) /* `#${(this.fillColor & 0xFFFFFF).toString(16).padStart(6, '0')}`*/);
    this.lightStyler = new DendrogramTreeStyler(
      this.lineWidth, this.nodeSize,
      false, DG.Color.toRgb(this.lightStrokeColor), DG.Color.toRgb(this.lightFillColor));
    this.selectedStyler = new DendrogramTreeStyler(
      this.lineWidth, this.nodeSize,
      false, DG.Color.toRgb(this.selectedStrokeColor), DG.Color.toRgb(this.selectedFillColor));
  }

  private _newick: string;

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
      this.mainStyler.lineWidth = this.lightStyler.lineWidth = this.selectedStyler.lineWidth = this.lineWidth;
      break;

    case PROPS.nodeSize:
      this.mainStyler.nodeSize = this.lightStyler.nodeSize = this.selectedStyler.nodeSize = this.nodeSize;
      break;

    case PROPS.showGrid:
      this.mainStyler.showGrid = this.showGrid;
      break;

    case PROPS.mainStrokeColor:
      this.mainStyler.strokeColor = `#${(this.mainStrokeColor & 0xFFFFFF).toString(16).padStart(6, '0')}`;
      break;

    case PROPS.mainFillColor:
      this.mainStyler.fillColor = `#${(this.mainFillColor & 0xFFFFFF).toString(16).padStart(6, '0')}`;
      break;

    case PROPS.lightStrokeColor:
      this.lightStyler.strokeColor = DG.Color.toRgb(this.lightStrokeColor);
      break;

    case PROPS.lightFillColor:
      this.lightStyler.fillColor = DG.Color.toRgb(this.lightFillColor);
      break;

    case PROPS.selectedStrokeColor:
      this.selectedStyler.strokeColor = DG.Color.toRgb(this.selectedStrokeColor);
      break;

    case PROPS.selectedFillColor:
      this.selectedStyler.fillColor = DG.Color.toRgb(this.selectedFillColor);
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

  private placer?: RectangleTreePlacer<MarkupNodeType>;
  private renderer?: TreeRendererBase<MarkupNodeType, RectangleTreeHoverType<MarkupNodeType>>;

  private destroyView(): void {
    console.debug('PhyloTreeViewer: Dendrogram.destroyView()');

    this.renderer!.detach();
    delete this.renderer;

    delete this.placer;

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
    this.placer = new RectangleTreePlacer<MarkupNodeType>(
      treeRoot.minIndex - 0.5, treeRoot.maxIndex + 0.5, totalLength);
    this.renderer = new CanvasTreeRenderer(
      treeRoot, this.placer, this.mainStyler, this.lightStyler, this.selectedStyler);
    this.viewSubs.push(this.renderer.onHoverChanged.subscribe(this.rendererOnHoverChanged.bind(this)));
    this.viewSubs.push(this.renderer.onSelectionChanged.subscribe(this.rendererOnSelectionChanged.bind(this)));
    this.renderer.attach(this.treeDiv);

    this.viewSubs.push(ui.onSizeChanged(this.root).subscribe(this.rootOnSizeChanged.bind(this)));
    // this.viewSubs.push(this.mainStyler.onStylingChanged.subscribe(this.stylerOnStylingChanged.bind(this)));
    this.viewSubs.push(this.mainStyler.onTooltipShow.subscribe(this.stylerOnTooltipShow.bind(this)));

    this.viewSubs.push(this.dataFrame.onSelectionChanged.subscribe(this.dataFrameOnSelectionChanged.bind(this)));
  }

  // -- Handle controls events --

  private rootOnSizeChanged() {
    console.debug('PhyloTreeViewer: Dendrogram.rootOnSizeChanged()');

    this.treeDiv!.style.width = `${this.root.clientWidth}px`;
    this.treeDiv!.style.height = `${this.root.clientHeight}px`;
  }

  private rendererOnHoverChanged() {
    window.setTimeout(() => {
      if (!this.renderer) return;

      // TODO: Handle hover
    });
  }

  private rendererOnSelectionChanged() {
    window.setTimeout(() => {
      if (!this.renderer) return;

      const oldSelection: DG.BitSet = this.dataFrame.selection.clone();
      if (this.renderer.selectedNodes.length == 0) {
        this.dataFrame.selection.init((rowI) => { return false; }, false);
      } else {
        if (this.nodeColumnName) {
          const nodeCol: DG.Column = this.dataFrame.getCol(this.nodeColumnName);
          const th = new TreeHelper();
          const nodeNameSet = new Set(
            this.renderer.selectedNodes
              .map((sn) => th.getNodeList(sn).map((n) => n.name))
              .flat());
          console.debug('PhyloTreeViewer: Dendrogram.rendererOnSelectionChanged(), ' +
            `nodeNameSet = ${JSON.stringify([...nodeNameSet])}`);

          this.dataFrame.selection.init(
            (rowI) => {
              const nodeName = nodeCol.get(rowI);
              return nodeNameSet.has(nodeName);
            },
            false);
        }
      }

      const newSelection: DG.BitSet = this.dataFrame.selection;
      let selectionChanged: boolean = oldSelection.length !== newSelection.length || // != -> true (changed)
        oldSelection.trueCount !== newSelection.trueCount;
      if (!selectionChanged) {
        for (let rowI: number = 0; rowI < oldSelection.length; rowI++) {
          if (oldSelection.get(rowI) !== newSelection.get(rowI)) {
            selectionChanged = true;
            break;
          }
        }
      }
      if (selectionChanged)
        this.dataFrame.selection.fireChanged();
    }, 0 /* next event cycle*/);
  }

  private dataFrameOnSelectionChanged(value: any) {
    if (!this.renderer) return;

    if (this.nodeColumnName) {
      const rowCount: number = this.dataFrame.rowCount;
      const nodeCol: DG.Column = this.dataFrame.getCol(this.nodeColumnName);
      const nodeNameSet = new Set<string>(
        wu(this.dataFrame.selection.getSelectedIndexes()).map((rowI) => nodeCol.get(rowI)));

      const th: TreeHelper = new TreeHelper();
      const selections: RectangleTreeHoverType<MarkupNodeType>[] = th
        .getNodeList(this.renderer.treeRoot)
        .filter((node) => nodeNameSet.has(node.name))
        .map((node) => {
          return {
            node: node as MarkupNodeType,
            nodeHeight: this.placer!.getNodeHeight(this.renderer!.treeRoot, node)!
          };
        });

      this.renderer.selections = selections;
    }
  }

  private stylerOnTooltipShow({node, e}: { node: MarkupNodeType, e: MouseEvent }): void {
    if (node) {
      const tooltip = ui.divV([
        ui.div(`${node.name}`)]);
      ui.tooltip.show(tooltip, e.clientX + 16, e.clientY + 16);
    } else {
      ui.tooltip.hide();
    }
  }

  // private stylerOnStylingChanged() {
  //   this.lightStyler.lineWidth = this.getHighlightStylerLineWidth();
  //   this.lightStyler.nodeSize = this.getHighlightStylerNodeSize();
  //
  //   this.selectedStyler.lineWidth = this.getSelectionStylerLineWidth();
  //   this.selectedStyler.nodeSize = this.getSelectionStylerNodeSize();
  // }

  // getHighlightStylerLineWidth(): number {
  //   return Math.max(this.mainStyler.lineWidth + 4, this.mainStyler.lineWidth * 1.8);
  // }
  //
  // getHighlightStylerNodeSize(): number {
  //   return Math.max(this.mainStyler.nodeSize + 4, this.mainStyler.nodeSize * 1.8);
  // }
  //
  // getSelectionStylerLineWidth(): number {
  //   return Math.max(this.mainStyler.lineWidth + 2, this.mainStyler.lineWidth * 1.4);
  // }
  //
  // getSelectionStylerNodeSize(): number {
  //   return Math.max(this.mainStyler.nodeSize + 2, this.mainStyler.nodeSize * 1.4);
  // }
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
