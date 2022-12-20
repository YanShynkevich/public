import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import * as rxjs from 'rxjs';
import {NodeType} from '@datagrok-libraries/bio';
import {TreeRendererBase} from './tree-renderer-base';
import {ITreePlacer, ITreeStyler, MarkupNodeType, renderNode, TraceTargetType, TreeStylerBase} from './markup';
import {RectangleTreeHoverType, RectangleTreePlacer} from './rectangle-tree-placer';
import {Dendrogram} from '../dendrogram';
import {selection} from 'd3';
import {TreeHelper} from '../../utils/tree-helper';

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
  protected readonly currentStyler: ITreeStyler<TNode>;
  protected readonly mouseOverStyler: ITreeStyler<TNode>;
  protected readonly selectionStyler: ITreeStyler<TNode>;

  constructor(
    treeRoot: TNode, placer: RectangleTreePlacer<TNode>,
    mainStyler: ITreeStyler<TNode>, lightStyler: ITreeStyler<TNode>,
    currentStyler: ITreeStyler<TNode>, mouseOverStyler: ITreeStyler<TNode>, selectionStyler: ITreeStyler<TNode>
  ) {
    super(treeRoot);

    this.placer = placer;
    this.placer.onPlacingChanged.subscribe(this.placerOnChanged.bind(this));

    this.mainStyler = mainStyler;
    this.mainStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.lightStyler = lightStyler;
    this.lightStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.currentStyler = currentStyler;
    this.currentStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.mouseOverStyler = mouseOverStyler;
    this.mouseOverStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    this.selectionStyler = selectionStyler;
    this.selectionStyler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    let k = 11;

    // this.view onSizeChanged event handled with ancestor TreeRenderBase calls this.render()
  }

  private renderCounter: number = 0;

  /**
   * Leaves along axis has step 1 for every leaf.
   * Draw tree along all canvas height in terms of leaves' axis placement.
   */
  render(purpose: string): void {
    if (!this.view || !this.canvas) return;

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
      (function clearNodeDesc(node: TNode) {
        node.desc = '';
        for (const childNode of (node.children ?? []))
          clearNodeDesc(childNode as TNode);
      })(this.treeRoot);

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

      const invisibleStyler = new TreeStylerBase<TNode>('invisible', 0, 0, false, '#00000000', '#00000000');

      this.renderCounter++;
      console.debug(`*** ${this.renderCounter} PhyloTreeViewer: CanvasTreeRenderer.render(), ` +
        `main & light, traceback hover & selection, ` +
        `purpose ${purpose}`);
      const styler: ITreeStyler<TNode> = !this.mouseOver ? this.mainStyler : this.lightStyler;
      const selectionTraceList: TraceTargetType<TNode>[] = this.selections.map(
        (sel) => { return {target: sel.node, styler: this.selectionStyler};});
      renderNode(ctx, this.treeRoot,
        this.placer.top, this.placer.bottom,
        this.placer.padding.left, lengthRatio, stepRatio, styler,
        this.placer.totalLength, 0,
        [...selectionTraceList,]);

      for (const selection of this.selections) {
        renderNode(ctx, selection.node,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, this.selectionStyler,
          this.placer.totalLength, selection.nodeHeight,
          []);
      }

      if (this.current) {
        const currentTraceList: TraceTargetType<TNode>[] = [{target: this.current.node, styler: this.currentStyler}];
        renderNode(ctx, this.treeRoot,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, invisibleStyler,
          this.placer.totalLength, 0,
          [...currentTraceList]);

        // children
        // renderNode(ctx, this.current.node,
        //   this.placer.top, this.placer.bottom,
        //   this.placer.padding.left, lengthRatio, stepRatio, this.currentStyler,
        //   this.placer.totalLength, this.current.nodeHeight,
        //   []);
      }

      if (this.mouseOver) {
        const mouseOverTraceList: TraceTargetType<TNode>[] = [
          {target: this.mouseOver.node, styler: this.mouseOverStyler}];
        renderNode(ctx, this.treeRoot,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, invisibleStyler,
          this.placer.totalLength, 0,
          [...mouseOverTraceList]);

        // children
        renderNode(ctx, this.mouseOver.node,
          this.placer.top, this.placer.bottom,
          this.placer.padding.left, lengthRatio, stepRatio, this.mouseOverStyler,
          this.placer.totalLength, this.mouseOver.nodeHeight,
          []);
      }

      console.debug('');
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
    this.render('placerOnChanged()');
  }

  private stylerOnChanged() {
    this.render('stylerOnChanged()');
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
      this.mouseOver = this.placer.getNode(this.treeRoot, pos, scaledNodeSize);

      this.mainStyler.fireTooltipShow(this.mouseOver ? this.mouseOver.node : null, e);
    }
  }

  private selectedIds: string[] = [];

  private canvasOnClick(e: MouseEvent) {


    if (e.button == 0) {
      if (e.ctrlKey) {
        if (this.mouseOver) {
          const selections = [...this.selections];
          let deselectedIdx = -1;
          let replaceTo = -1;
          const th = new TreeHelper();
          for (let selI = 0; selI < this.selections.length; selI++) {
            const selection = this.selections[selI];
            if (selection.node == this.mouseOver!.node) {
              deselectedIdx = selI;
            }
            if (th.includes(selection.node, this.mouseOver.node)) {
              // Do nothing, because the clicked node (this.mouseOver.node) is sub of already selected
            }
            if (th.includes(this.mouseOver.node, selection.node)) {
              replaceTo = selI;
            }
          }
          if (deselectedIdx != -1) {
            selections.splice(deselectedIdx, 1);
          } else if (replaceTo != -1) {
            selections[replaceTo] = this.mouseOver;
          } else {
            selections.push(this.mouseOver);
          }

          this.selections = selections;
        }
      } else {
        this.current = this.mouseOver;
      }

      // if (!e.ctrlKey) {
      //   this.selections = this.hover ? [this.hover] : [];
      // } else {
      //   if (this.hover)
      //     this.selections = [...this.selections, this.hover];
      //
      //   if (this.hover)
      //     this._selectedNodes.push(this.hover.node);
      // }
    }
  }

  // -- Coords --

}
