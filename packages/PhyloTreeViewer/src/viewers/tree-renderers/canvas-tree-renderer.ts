import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import * as rxjs from 'rxjs';
import {NodeType} from '@datagrok-libraries/bio';
import {TreeRendererBase} from './tree-renderer-base';
import {HoverType, ITreePlacer, ITreeStyler, MarkupNodeType, renderNode} from './markup';
import {RectangleTreeHoverType, RectangleTreePlacer} from './rectangle-tree-placer';
import {Dendrogram} from '../dendrogram';
import {selection} from 'd3';

function canvasToTreePoint(canvasPoint: DG.Point, canvas: HTMLCanvasElement, placer: RectangleTreePlacer): DG.Point {
  const res: DG.Point = new DG.Point(
    0 + placer.totalLength * canvasPoint.x / canvas.clientWidth,
    placer.top + placer.height * canvasPoint.y / canvas.clientHeight);
  return res;
}

export class CanvasTreeRenderer<TNode extends MarkupNodeType> extends TreeRendererBase<TNode> {

  protected canvas?: HTMLCanvasElement;

  protected readonly placer: RectangleTreePlacer;

  protected readonly styler: ITreeStyler;
  protected readonly highlightStyler: ITreeStyler;
  protected readonly selectionStyler: ITreeStyler;

  constructor(
    treeRoot: TNode, placer: RectangleTreePlacer,
    styler: ITreeStyler, highlightStyler: ITreeStyler, selectionStyler: ITreeStyler) {
    super(treeRoot);

    this.placer = placer;
    this.placer.onPlacingChanged.subscribe(this.placerOnChanged.bind(this));

    this.styler = styler;
    this.styler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.highlightStyler = highlightStyler;
    this.highlightStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.selectionStyler = selectionStyler;
    this.selectionStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    let k = 11;

    // this.view onSizeChanged event handled with ancestor TreeRenderBase calls this.render()
  }

  /**
   * Leaves along axis has step 1 for every leaf.
   * Draw tree along all canvas height in terms of leaves' axis placement.
   */
  render(): void {
    if (!this.view || !this.canvas) return;
    console.debug('PhyloTreeViewer: CanvasTreeRenderer.render() ' +
      ``);

    const cw: number = this.view.clientWidth - 10;
    const ch: number = this.view.clientHeight;

    this.canvas.width = cw * window.devicePixelRatio;
    this.canvas.height = ch * window.devicePixelRatio;
    this.canvas.style.left = `${10}px`;
    this.canvas.style.top = `${0}px`;
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;

    // TODO:
    const ctx = this.canvas.getContext('2d')!;

    // Here we will render range of leaves
    const plotWidth: number = cw - this.placer.padding.left - this.placer.padding.right;
    const plotHeight: number = ch;
    const lengthRatio: number = window.devicePixelRatio * plotWidth / this.placer.totalLength; // px/[length unit]
    const stepRatio: number = window.devicePixelRatio * (ch / (this.placer.bottom - this.placer.top)); // px/[step unit, row]

    ctx.save();
    try {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // large red diagonal cross
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

      for (const selection of this.selections) {
        renderNode(ctx, selection.node,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, this.selectionStyler,
          this.placer.totalLength, selection.nodeHeight);
      }

      renderNode(ctx, this.treeRoot,
        this.placer.top, this.placer.bottom,
        this.placer.padding.left, lengthRatio, stepRatio, this.styler,
        this.placer.totalLength, 0);
    } finally {
      ctx.restore();
      this._onAfterRender.next({target: this, context: ctx, lengthRatio,});
    }
  }

  // -- View --

  public override attach(view: HTMLElement): void {
    super.attach(view);
    this.canvas = ui.canvas();
    this.view!.appendChild(this.canvas);

    this.subs.push(rxjs.fromEvent<WheelEvent>(this.canvas, 'wheel').subscribe(this.canvasOnWheel.bind(this)));
    this.subs.push(rxjs.fromEvent<MouseEvent>(this.canvas, 'mousedown').subscribe(this.canvasOnMouseDown.bind(this)));
    this.subs.push(rxjs.fromEvent<MouseEvent>(this.canvas, 'mouseup').subscribe(this.canvasOnMouseUp.bind(this)));
    this.subs.push(rxjs.fromEvent<MouseEvent>(this.canvas, 'mousemove').subscribe(this.canvasOnMouseMove.bind(this)));
    this.subs.push(rxjs.fromEvent<MouseEvent>(this.canvas, 'click').subscribe(this.canvasOnClick.bind(this)));
  }

  public override detach(): void {
    this.canvas!.remove();
    delete this.canvas;
    super.detach();
  }

  // -- Handle events --

  private placerOnChanged() {
    this.render();
  }

  private stylerOnChanged() {
    this.render();
  }

  private canvasOnWheel(e: WheelEvent): void {
    if (!this.canvas) return;
    e.preventDefault();

    const pos = canvasToTreePoint(new DG.Point(e.offsetX, e.offsetY), this.canvas, this.placer);

    // @ts-ignore
    const delta: number = e.wheelDelta / -168;
    const newTop = pos.y - (pos.y - this.placer.top) * (1 + 0.2 * delta);
    const newBottom = pos.y + (this.placer.bottom - pos.y) * (1 + 0.2 * delta);

    this.placer.update({top: newTop, bottom: newBottom});

    // e.stopPropagation();
  }

  private mouseDragging: { pos: DG.Point, top: number, bottom: number } | null;
  protected hover: RectangleTreeHoverType<MarkupNodeType> | null;

  protected selections: RectangleTreeHoverType<MarkupNodeType>[] = [];

  private canvasOnMouseDown(e: MouseEvent) {
    if (!this.view || !this.canvas) return;

    const pos = canvasToTreePoint(new DG.Point(e.offsetX, e.offsetY), this.canvas, this.placer);
    this.mouseDragging = {pos: pos, top: this.placer.top, bottom: this.placer.bottom};
  }

  private canvasOnMouseUp(e: MouseEvent) {
    this.mouseDragging = null;
  }

  private canvasOnMouseMove(e: MouseEvent) {
    if (!this.view || !this.canvas) return;

    const pos = canvasToTreePoint(new DG.Point(e.offsetX, e.offsetY), this.canvas, this.placer);

    const md = this.mouseDragging;
    if (md) {
      const mousePosY: number = md.top + e.offsetY * this.placer.height / this.canvas.clientHeight;
      const deltaPosY = md.pos.y - mousePosY;

      this.placer.update({
        top: md.top + deltaPosY,
        bottom: md.bottom + deltaPosY
      });
      const tooltip = ui.divV([
        ui.div(`pos = ${JSON.stringify(pos)},\n`),
        ui.div(`md = ${JSON.stringify(md)}`)]);
      ui.tooltip.show(tooltip, e.clientX + 16, e.clientY + 16);
    } else {

      // console.debug('CanvasTreeRender.onMouseMove() --- getNode() ---');
      const scaledNodeSize = 0.4 * this.placer.height / this.canvas.clientHeight;
      this.hover = this.placer.getNode(this.treeRoot, pos, scaledNodeSize);
      this._hoveredNode = this.hover ? this.hover.node as TNode : null;
      this.render();
      this._onHoverChanged.next();

      const tooltip = ui.divV([
        ui.div(`pos = ${JSON.stringify(pos)}`),
        ui.div(`node = ${JSON.stringify(this.hover ? {
          nodeHeight: this.hover.nodeHeight,
          name: this.hover.node.name
        } : null)}`)]);
      ui.tooltip.show(tooltip, e.clientX + 16, e.clientY + 16);
    }
  }

  private selectedIds: string[] = [];

  private canvasOnClick(e: MouseEvent) {
    if (e.button == 0) {
      if (!e.ctrlKey) {
        this.selections = this.hover ? [this.hover] : [];
        this._selectedNodes = this._hoveredNode ? [this._hoveredNode] : [];
      } else {
        if (this.hover)
          this.selections.push(this.hover);

        if (this._hoveredNode)
          this._selectedNodes.push(this._hoveredNode);
      }

      this.render();
      this._onSelectedChanged.next();
    }
  }

  // -- Coords --

}
