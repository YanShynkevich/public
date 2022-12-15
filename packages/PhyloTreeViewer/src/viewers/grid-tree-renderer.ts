import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {ITreeHelper, NodeType} from '@datagrok-libraries/bio';

import {TreeHelper} from '../utils/tree-helper';
import {CanvasTreeRenderer} from './tree-renderers/canvas-tree-renderer';
import {ITreeStyler, MarkupNodeType} from './tree-renderers/markup';
import {RectangleTreeHoverType, RectangleTreePlacer} from './tree-renderers/rectangle-tree-placer';

// export type GridTreeRendererEventArgsType<TNode extends NodeType> = {
//   target: GridTreeRendererBase<TNode>,
//   context: CanvasRenderingContext2D,
//   lengthRatio: number,
// };

class GridTreePlacer<TNode extends MarkupNodeType> extends RectangleTreePlacer<TNode> {

  private readonly grid: DG.Grid;

  constructor(grid: DG.Grid, totalLength: number) {
    const top: number = Math.floor(grid.vertScroll.min) - 0.5;
    const rowsGridHeight: number = grid.root.clientHeight - grid.colHeaderHeight;
    const bottom = top + (rowsGridHeight / grid.props.rowHeight);

    super(top, bottom, totalLength);

    this.grid = grid;

    this.grid.onBeforeDrawContent.subscribe(this.gridOnChanged.bind(this));
    ui.onSizeChanged(this.grid.root).subscribe(this.gridOnChanged.bind(this));
  }

  // getNode(node: MarkupNodeType, point: DG.Point): RectangleTreeHoverType | null {
  //   // TODO: implement getNode
  //   return null;
  // }

  private gridOnChanged() {
    // const firstRowIndex: number = Math.floor(this.grid.vertScroll.min);
    // const rowsGridHeight: number = this.grid.root.clientHeight - this.grid.colHeaderHeight;
    // const lastRowIndex: number = firstRowIndex + Math.ceil(rowsGridHeight / this.grid.props.rowHeight);

    const top: number = Math.floor(this.grid.vertScroll.min) - 0.5;
    const rowsGridHeight: number = this.grid.root.clientHeight - this.grid.colHeaderHeight;
    const bottom = top + (rowsGridHeight / this.grid.props.rowHeight);

    this.update({top, bottom});
  }
}

export abstract class GridTreeRendererBase<TNode extends MarkupNodeType> extends CanvasTreeRenderer<TNode> {
  protected _leftPadding: number = 6;
  protected _rightPadding: number = 6;

  private readonly th: ITreeHelper;

  protected readonly _grid: DG.Grid;

  get grid(): DG.Grid { return this._grid; }

  get leftPadding(): number { return this._leftPadding; }

  get rightPadding(): number { return this._rightPadding; }

  protected constructor(
    treeRoot: TNode, totalLength: number, grid: DG.Grid,
    styler: ITreeStyler<TNode>, highlightStyler: ITreeStyler<TNode>, selectionStyler: ITreeStyler<TNode>
  ) {
    const placer: RectangleTreePlacer<TNode> = new GridTreePlacer<TNode>(grid, totalLength);
    super(treeRoot, placer, styler, highlightStyler, selectionStyler);

    this.th = new TreeHelper();
    this._grid = grid;
    //this.subs.push(this.grid.onBeforeDrawContent.subscribe(this.render.bind(this)));
    //this.subs.push(ui.onSizeChanged(this.grid.root).subscribe(this.render.bind(this)));
  }
}

