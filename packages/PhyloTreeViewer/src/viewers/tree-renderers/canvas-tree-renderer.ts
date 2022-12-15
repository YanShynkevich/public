import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import * as rxjs from 'rxjs';
import {NodeType} from '@datagrok-libraries/bio';
import {TreeRendererBase} from './tree-renderer-base';
import {ITreePlacer, ITreeStyler, MarkupNodeType, renderNode, TraceTargetType} from './markup';
import {RectangleTreeHoverType, RectangleTreePlacer} from './rectangle-tree-placer';
import {Dendrogram} from '../dendrogram';
import {selection} from 'd3';

function canvasToTreePoint<TNode extends MarkupNodeType>(
  canvasPoint: DG.Point, canvas: HTMLCanvasElement, placer: RectangleTreePlacer<TNode>
): DG.Point {
  const res: DG.Point = new DG.Point(
    0 + placer.totalLength * canvasPoint.x / canvas.clientWidth,
    placer.top + placer.height * canvasPoint.y / canvas.clientHeight);
  return res;
}

export class CanvasTreeRenderer<TNode extends MarkupNodeType>
  extends TreeRendererBase<TNode, RectangleTreeHoverType<TNode>> {

  protected canvas?: HTMLCanvasElement;

  protected readonly placer: RectangleTreePlacer<TNode>;

  protected readonly mainStyler: ITreeStyler<TNode>;
  protected readonly lightStyler: ITreeStyler<TNode>;
  protected readonly selectionStyler: ITreeStyler<TNode>;

  constructor(
    treeRoot: TNode, placer: RectangleTreePlacer<TNode>,
    mainStyler: ITreeStyler<TNode>, lightStyler: ITreeStyler<TNode>, selectionStyler: ITreeStyler<TNode>) {
    super(treeRoot);

    this.placer = placer;
    this.placer.onPlacingChanged.subscribe(this.placerOnChanged.bind(this));

    this.mainStyler = mainStyler;
    this.mainStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.lightStyler = lightStyler;
    this.lightStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

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

      // if (this.hover) {
      //   renderNode(ctx, this.hover.node,
      //     this.placer.top, this.placer.bottom,
      //     this.placer.padding.left, lengthRatio, stepRatio, this.lightStyler,
      //     this.placer.totalLength, this.hover.nodeHeight,
      //     []);
      // }

      console.debug('***');
      console.debug('PhyloTreeViewer: CanvasTreeRenderer.render() main & light, traceback hover & selection');
      const styler: ITreeStyler<TNode> = !this.hover ? this.mainStyler : this.lightStyler;
      const hoverTraceList: TraceTargetType<TNode>[] = !this.hover ? [] :
        [{target: this.hover.node, styler: this.mainStyler}];
      const selectionTraceList: TraceTargetType<TNode>[] = this.selections.map(
        (sel) => { return {target: sel.node, styler: this.selectionStyler};});
      renderNode(ctx, this.treeRoot,
        this.placer.top, this.placer.bottom,
        this.placer.padding.left, lengthRatio, stepRatio, styler,
        this.placer.totalLength, 0,
        [...hoverTraceList, ...selectionTraceList]);

      // -- Selection --

      console.debug('---');
      console.debug('PhyloTreeViewer: CanvasTreeRenderer.render() selections');
      for (const selection of this.selections) {
        renderNode(ctx, selection.node,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, this.selectionStyler,
          this.placer.totalLength, selection.nodeHeight,
          []);
      }
      console.debug('');
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
    } else {
      // console.debug('CanvasTreeRender.onMouseMove() --- getNode() ---');
      const scaledNodeSize = 0.4 * this.placer.height / this.canvas.clientHeight;
      this.hover = this.placer.getNode(this.treeRoot, pos, scaledNodeSize);
      this._hoveredNode = this.hover ? this.hover.node as TNode : null;
      this.render();
      this._onHoverChanged.next();

      this.mainStyler.fireTooltipShow(this.hover ? this.hover.node : null, e);
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
          this.selections = [...this.selections, this.hover];

        if (this.hover)
          this._selectedNodes.push(this.hover.node);
      }

      this.render();
      this._onSelectionChanged.next();
    }
  }

  // -- Coords --

}
