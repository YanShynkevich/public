import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import * as rxjs from 'rxjs';
import {NodeType} from '@datagrok-libraries/bio';
import {TreeRendererBase} from './tree-renderer-base';
import {ITreeStyler, MarkupNodeType, renderNode} from './markup';

export interface ITreePlacer {

  // Position of leaves' axis in canvas window
  /** -0.5 means half of row for first leaf*/
  get top(): number;

  get bottom(): number;

  get height(): number;

  get padding(): { left: number, right: number; };

  get onPlacingChanged(): rxjs.Observable<void>;

  update(params: { top?: number, bottom?: number }): void;
}

export class CanvasTreeRenderer<TNode extends MarkupNodeType> extends TreeRendererBase<TNode> {

  private readonly _canvas: HTMLCanvasElement;

  protected get canvas(): HTMLCanvasElement { return this._canvas; }

  protected readonly placer: ITreePlacer;

  protected readonly styler: ITreeStyler;

  constructor(treeRoot: TNode, totalLength: number, view: HTMLElement, placer: ITreePlacer, styler: ITreeStyler) {
    super(treeRoot, totalLength, view);

    this._canvas = ui.canvas();
    this.view.appendChild(this.canvas);

    this.placer = placer;
    this.placer.onPlacingChanged.subscribe(this.placerOnChanged.bind(this));

    this.styler = styler;
    this.styler.onStylingChanged.subscribe(this.stylerOnChanged.bind(this));

    let k = 11;

    rxjs.fromEvent<WheelEvent>(this.canvas, 'wheel').subscribe(this.canvasOnWheel.bind(this));
    rxjs.fromEvent<MouseEvent>(this.canvas, 'mousedown').subscribe(this.canvasOnMouseDown.bind(this));
    rxjs.fromEvent<MouseEvent>(this.canvas, 'mouseup').subscribe(this.canvasOnMouseUp.bind(this));
    rxjs.fromEvent<MouseEvent>(this.canvas, 'mousemove').subscribe(this.canvasOnMouseMove.bind(this));

    // this.view onSizeChanged event handled with ancestor TreeRenderBase calls this.render()
  }

  /**
   * Leaves along axis has step 1 for every leaf.
   * Draw tree along all canvas height in terms of leaves' axis placement.
   */
  render(): void {
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
    const lengthRatio: number = window.devicePixelRatio * plotWidth / this.totalLength; // px/[length unit]
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

      renderNode(ctx, this.treeRoot,
        this.placer.top, this.placer.bottom,
        this.placer.padding.left, lengthRatio, stepRatio, this.styler,
        this.treeRoot.subtreeLength!, 0);
    } finally {
      ctx.restore();
      this._onAfterRender.next({target: this, context: ctx, lengthRatio,});
    }
  }

  // -- Handle events --

  private placerOnChanged() {
    this.render();
  }

  private stylerOnChanged() {
    this.render();
  }

  private canvasOnWheel(e: WheelEvent): void {
    const mouseY: number = e.offsetY;
    console.debug('PhyloTreeViewer: CanvasTreeRenderer.canvasOnWheel() ' +
      `canvas.clientHeight = ${this.canvas.clientHeight}, mouseY = ${mouseY}`);
    e.preventDefault();

    const mousePosY: number = this.placer.top + mouseY * this.placer.height / this.canvas.clientHeight;

    // @ts-ignore
    const delta: number = e.wheelDelta / -168;
    const newTop = mousePosY - (mousePosY - this.placer.top) * (1 + 0.2 * delta);
    const newBottom = mousePosY + (this.placer.bottom - mousePosY) * (1 + 0.2 * delta);

    this.placer.update({top: newTop, bottom: newBottom});

    // e.stopPropagation();
  }

  private mouseDragging: { mousePosY: number, top: number, bottom: number } | null;

  private canvasOnMouseDown(e: MouseEvent) {
    const mousePosY: number = this.placer.top + e.y * this.placer.height / this.canvas.clientHeight;

    this.mouseDragging = {mousePosY: mousePosY, top: this.placer.top, bottom: this.placer.bottom};
  }

  private canvasOnMouseUp(e: MouseEvent) {
    this.mouseDragging = null;
  }

  private canvasOnMouseMove(e: MouseEvent) {
    const mouseY = e.offsetY;
    const mousePosY: number = this.placer.top + mouseY * this.placer.height / this.canvas.clientHeight;
    console.debug('PhyloTreeViewer: CanvasTreeRenderer.canvasOnMouseMove() ' +
      `mousePosY = ${mousePosY}, mouseY = ${mouseY}.`);

    const md = this.mouseDragging;
    if (md) {
      const mousePosY: number = md.top + e.y * this.placer.height / this.canvas.clientHeight;
      const deltaPosY = md.mousePosY - mousePosY;

      // const minY = this.treeRoot.minIndex - 0.5;
      // const maxY = this.treeRoot.maxIndex + 0.5;
      //
      // const deltaLimY = Math.min(...[deltaY, md.top + deltaY - minY, md.bottom + deltaY - maxY]);

      this.placer.update({
        top: md.top + deltaPosY,
        bottom: md.bottom + deltaPosY
      });
    } else {
      // ui.tooltip.show('Hallo', e.x, e.y);
    }
  }
}
