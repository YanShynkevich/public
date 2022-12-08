import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {Observable, Subject, Unsubscribable} from 'rxjs';

import {ITreeHelper, NodeType} from '@datagrok-libraries/bio';

import {TreeHelper} from '../utils/tree-helper';
import {TreeRendererBase} from './tree-renderers/tree-renderer-base';
import {CanvasTreeRenderer, ITreePlacer} from './tree-renderers/canvas-tree-renderer';
import {ITreeStyler, MarkupNodeType} from './tree-renderers/markup';
import {Grid} from 'datagrok-api/dg';

// export type GridTreeRendererEventArgsType<TNode extends NodeType> = {
//   target: GridTreeRendererBase<TNode>,
//   context: CanvasRenderingContext2D,
//   lengthRatio: number,
// };

class GridTreePlacer implements ITreePlacer {
  bottom: number;
  height: number;
  padding: { left: number; right: number };
  top: number;

  private readonly _onChanged: Subject<void>;

  get onPlacingChanged(): Observable<void> { return this._onChanged; }

  update(params: { top?: number; bottom?: number }): void {
    let changed: boolean = false;

    if (params.top && params.top != this.top) {
      this.top = params.top;
      changed = true;
    }

    if (params.bottom && params.bottom != this.bottom) {
      this.bottom = params.bottom;
      changed = true;
    }

    if (changed)
      this._onChanged.next();
  }

  private readonly grid: DG.Grid;

  constructor(grid: DG.Grid) {
    this.grid = grid;
    this._onChanged = new Subject<void>();

    this.grid.onBeforeDrawContent.subscribe(this.gridOnChanged.bind(this));
    ui.onSizeChanged(this.grid.root).subscribe(this.gridOnChanged.bind(this));
  }

  private gridOnChanged() {
    const firstRowIndex: number = Math.floor(this.grid.vertScroll.min);
    const rowsGridHeight: number = this.grid.root.clientHeight - this.grid.colHeaderHeight;
    const lastRowIndex: number = firstRowIndex + Math.ceil(rowsGridHeight / this.grid.props.rowHeight);

    this.update({
      top: firstRowIndex - 0.5,
      bottom: lastRowIndex + 0.5,
    });
  }
}

export abstract class GridTreeRendererBase<TNode extends MarkupNodeType>
  extends CanvasTreeRenderer<TNode> {
  protected _leftPadding: number = 6;
  protected _rightPadding: number = 6;

  private readonly th: ITreeHelper;

  protected readonly _grid: DG.Grid;

  get grid(): DG.Grid { return this._grid; }

  get leftPadding(): number { return this._leftPadding; }

  get rightPadding(): number { return this._rightPadding; }

  protected constructor(treeRoot: TNode, totalLength: number, view: HTMLElement, grid: DG.Grid, styler: ITreeStyler) {
    super(treeRoot, totalLength, view, new GridTreePlacer(grid), styler);

    this.th = new TreeHelper();
    this._grid = grid;
    this._totalLength = totalLength;
    //this.subs.push(this.grid.onBeforeDrawContent.subscribe(this.render.bind(this)));
    //this.subs.push(ui.onSizeChanged(this.grid.root).subscribe(this.render.bind(this)));
  }
}

