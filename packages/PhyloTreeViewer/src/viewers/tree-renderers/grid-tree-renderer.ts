import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import {NodeType} from '@datagrok-libraries/bio';
import {GridTreeRendererBase} from '../grid-tree-renderer';
import {ITreeStyler, markupNode, MarkupNodeType, renderNode} from './markup';
import {Observable, Subject} from 'rxjs';
import {Dendrogram} from '../dendrogram';
import {RectangleTreeHoverType} from './rectangle-tree-placer';

/** Draws only nodes/leaves visible in leaf range */
export class LeafRangeGridTreeRenderer extends GridTreeRendererBase<MarkupNodeType> {

  constructor(
    tree: MarkupNodeType, totalLength: number, grid: DG.Grid,
    styler: ITreeStyler, highlightStyler: ITreeStyler, selectionStyler: ITreeStyler
  ) {
    super(tree, totalLength, grid, styler, highlightStyler, selectionStyler);
  }

  public render(): void {
    if (!this.view || !this.canvas) return;

    const dpr = window.devicePixelRatio;

    const firstRowIndex: number = Math.floor(this._grid.vertScroll.min);
    const rowsGridHeight: number = this._grid.root.clientHeight - this._grid.colHeaderHeight;
    const lastRowIndex: number = firstRowIndex + Math.ceil(rowsGridHeight / this._grid.props.rowHeight);

    console.debug('PhyloTreeViewer: LeafRangeTreeRenderer.render() ' +
      `firstRowIndex = ${firstRowIndex}, lastRowIndex = ${lastRowIndex}`);

    const cw: number = this.view.clientWidth;

    // this.treeDiv.clientHeight is incorrect on start without resize, workaround using this.grid.root.clientHeight
    this.view.style.height = `${this.grid.root.clientHeight}px`;
    const ch: number = this.view.clientHeight - this.grid.colHeaderHeight;
    //const ch: number = this.grid.root.clientHeight - this.grid.colHeaderHeight;

    this.canvas.width = cw * dpr;
    this.canvas.height = ch * dpr;
    this.canvas.style.left = `${0}px`;
    this.canvas.style.top = `${this.grid.colHeaderHeight}px`;
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;

    // TODO:
    const ctx = this.canvas.getContext('2d')!;

    // Here we will render range of leaves
    const lengthRatio: number = dpr * (cw - this.leftPadding - this.rightPadding) / this.placer.totalLength; // px/[length unit]
    const stepRatio: number = dpr * this.grid.props.rowHeight; // px/[step unit, row]

    ctx.save();
    try {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // ctx.beginPath();
      // ctx.strokeStyle = '#800000';
      // ctx.moveTo(0, 0);
      // ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
      // ctx.moveTo(0, ctx.canvas.height);
      // ctx.lineTo(ctx.canvas.width, 0);
      // ctx.stroke();

      if (this.hover) {
        renderNode(ctx, this.hover.node,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, this.highlightStyler,
          this.placer.totalLength, this.hover.nodeHeight);
      }

      renderNode(ctx, this.treeRoot as MarkupNodeType,
        firstRowIndex - 0.5, lastRowIndex + 0.5, this.leftPadding,
        lengthRatio, stepRatio, this.styler,
        this.treeRoot.subtreeLength!, 0);
    } finally {
      ctx.restore();
      this._onAfterRender.next({target: this, context: ctx, lengthRatio,});
    }
  }

  // -- View --

  public override attach(view: HTMLElement) {
    super.attach(view);

    this.view!.style.setProperty('overflow-y', 'hidden', 'important');
    this.canvas!.style.position = 'absolute';
  }

  // --

  public static create(tree: NodeType, grid: DG.Grid): GridTreeRendererBase<MarkupNodeType> {
    // TODO: adapt tree: bio.NodeType to MarkupNodeType
    markupNode(tree);
    const totalLength: number = (tree as MarkupNodeType).subtreeLength!;

    if (Number.isNaN(totalLength))
      throw new Error('Can not calculate totalLength for the tree.');

    const styler = new class implements ITreeStyler {
      lineWidth: number = 1;
      nodeSize: number = 3;
      showGrid: boolean = true;
      strokeColor: string = '#000000';
      fillColor: string = '#000000';
      onStylingChanged: Observable<void> = new Subject<void>();
    }();

    const highlightStyler = new class implements ITreeStyler {
      lineWidth: number = 5;
      nodeSize: number = 7;
      showGrid: boolean = true;
      strokeColor: string = '#FFFF0040';
      fillColor: string = '#FFFF0040';
      onStylingChanged: Observable<void> = new Subject<void>();
    }();

    const selectionStyler = new class implements ITreeStyler {
      lineWidth: number = 3;
      nodeSize: number = 5;
      showGrid: boolean = true;
      strokeColor: string = '#88FF88C0';
      fillColor: string = '#88FF88C0';
      onStylingChanged: Observable<void> = new Subject<void>();
    }();

    return new LeafRangeGridTreeRenderer(tree as MarkupNodeType, totalLength, grid,
      styler, highlightStyler, selectionStyler);
  }
}