import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';

import * as rxjs from 'rxjs';
import {NodeType} from '@datagrok-libraries/bio';
import {TreeRendererBase} from './tree-renderer-base';
import {MarkupNodeType, renderNode} from './markup';

interface ITreePlacer {

  // Position of leaves' axis in canvas window
  /** -0.5 means half of row for first leaf*/
  top: number;
  bottom: number;

  height: number;

  padding: { left: number, right: number; };
}

export class CanvasTreeRenderer<TNode extends MarkupNodeType> extends TreeRendererBase<TNode> {

  private readonly _canvas: HTMLCanvasElement;

  protected get canvas(): HTMLCanvasElement { return this._canvas; }

  protected readonly placer: ITreePlacer;

  constructor(treeRoot: TNode, totalLength: number, view: HTMLElement) {
    super(treeRoot, totalLength, view);

    this._canvas = ui.canvas();
    this.view.appendChild(this.canvas);

    this.placer = new class implements ITreePlacer {
      private _top: number;
      get top(): number { return this._top; }

      private _bottom: number;
      get bottom() { return this._bottom;}

      get height() { return this._bottom - this._top; }

      get padding() { return {left: 8, right: 8,};}

      constructor(top: number, bottom: number) {
        this._top = top;
        this._bottom = bottom;
      }
    }(this.treeRoot.minIndex - 0.5, this.treeRoot.maxIndex + 0.5);

    let k = 11;

    rxjs.fromEvent<WheelEvent>(this.canvas, 'wheel').subscribe(this.canvasOnWheel.bind(this));

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

      // ctx.beginPath();
      // ctx.strokeStyle = '#800000';
      // ctx.moveTo(0, 0);
      // ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
      // ctx.moveTo(0, ctx.canvas.height);
      // ctx.lineTo(ctx.canvas.width, 0);
      // ctx.stroke();

      renderNode(ctx, this.treeRoot,
        this.placer.top, this.placer.bottom,
        this.placer.padding.left, lengthRatio, stepRatio,
        this.treeRoot.subtreeLength!, 0);
    } finally {
      ctx.restore();
      this._onAfterRender.next({target: this, context: ctx, lengthRatio,});
    }
  }

  // -- Handle events --

  private canvasOnWheel(e: WheelEvent): void {
    const mousePosY: number = this.placer.top + e.clientY * this.placer.height / this.canvas.height;


    e.stopPropagation();
  }
}
