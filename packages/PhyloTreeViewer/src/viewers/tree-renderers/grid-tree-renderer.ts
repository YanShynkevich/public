import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import {NodeType} from '@datagrok-libraries/bio';
import {GridTreeRendererBase} from '../grid-tree-renderer';
import {ITreeStyler, markupNode, MarkupNodeType, renderNode, TreeStylerBase} from './markup';
import {Observable, Subject} from 'rxjs';

/** Draws only nodes/leaves visible in leaf range */
export class LeafRangeGridTreeRenderer extends GridTreeRendererBase<MarkupNodeType> {

  constructor(
    tree: MarkupNodeType, totalLength: number, grid: DG.Grid,
    styler: ITreeStyler<MarkupNodeType>, highlightStyler: ITreeStyler<MarkupNodeType>,
    selectionStyler: ITreeStyler<MarkupNodeType>
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
          this.placer.padding.left, lengthRatio, stepRatio, this.lightStyler,
          this.placer.totalLength, this.hover.nodeHeight,
          []);
      }

      renderNode(ctx, this.treeRoot as MarkupNodeType,
        firstRowIndex - 0.5, lastRowIndex + 0.5, this.leftPadding,
        lengthRatio, stepRatio, this.mainStyler,
        this.treeRoot.subtreeLength!, 0,
        []);

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

    const styler = new TreeStylerBase<MarkupNodeType>(1, 3, true, '#000000', '#000000');
    styler.onTooltipShow.subscribe(({node, e}) => {
      if (node) {
        const tooltip = ui.divV([
          ui.div(`${node.name}`)]);
        ui.tooltip.show(tooltip, e.clientX + 16, e.clientY + 16);
      } else {
        ui.tooltip.hide();
      }
    });

    const highlightStyler = new TreeStylerBase<MarkupNodeType>(
      5, 7, true, '#FFFF0040', '#FFFF0040');

    const selectionStyler = new TreeStylerBase<MarkupNodeType>(
      3, 5, true, '#88FF88C0', '#88FF88C0');

    return new LeafRangeGridTreeRenderer(tree as MarkupNodeType, totalLength, grid,
      styler, highlightStyler, selectionStyler);
  }
}