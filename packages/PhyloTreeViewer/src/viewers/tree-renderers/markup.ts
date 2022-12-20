import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import * as rxjs from 'rxjs';

import {isLeaf, NodeType} from '@datagrok-libraries/bio';
import {line} from 'd3';

/** Markup node for node and its subtree place on axis of leaves. */
export type MarkupNodeType = NodeType & {
  children: MarkupNodeType[],
  index: number,
  minIndex: number,
  maxIndex: number,
  /** node's branch_length with max subtreeLength of children */
  subtreeLength?: number,
  desc?: string,
};

/**
 *
 * @param node
 * @param currentLeafIndex
 * @return {number} Index pointing to the next leaf
 */
export function markupNode(
  node: MarkupNodeType | NodeType, currentLeafIndex: number = 0
): void {
  function markupNodeInt(node: MarkupNodeType, currentLeafIndex: number) {
    if (isLeaf(node)) {
      node.index = currentLeafIndex;
      node.subtreeLength = node.branch_length!;

      return currentLeafIndex + 1;
    } else {
      let maxSubtreeLength = 0;
      let leafIndex: number = currentLeafIndex;
      node.minIndex = leafIndex;
      for (const childNode of node.children!) {
        leafIndex = markupNodeInt(childNode, leafIndex);

        if (maxSubtreeLength < childNode.subtreeLength!) maxSubtreeLength = childNode.subtreeLength!;
      }
      node.maxIndex = leafIndex - 1; // leafIndex points to the next leaf already
      node.index = node.children.map((n) => (n as MarkupNodeType).index)
        .reduce((a, b) => a + b) / node.children.length;
      node.subtreeLength = maxSubtreeLength + node.branch_length!;

      return leafIndex;
    }
  }

  const t1: number = Date.now();
  markupNodeInt(node as MarkupNodeType, currentLeafIndex);
  const t2: number = Date.now();
  console.debug('PhyloTreeViewer: markupNode() ' + `ET: ${((t2 - t1) / 1000).toString()} s`);
}

export type HoverType<TNode> = { get node(): TNode };

export interface ITreePlacer<TNode, THover extends HoverType<TNode>> {

  // Position of leaves' axis in canvas window
  /** -0.5 means half of row for first leaf*/
  get top(): number;

  get bottom(): number;

  get height(): number;

  get totalLength(): number;

  get padding(): { left: number, right: number; };

  get onPlacingChanged(): rxjs.Observable<void>;

  update(params: { top?: number, bottom?: number, totalLength?: number }): void;

  /**
   * @param node
   * @param point
   * @param nodeSize Units of leaves axis scale
   */
  getNode(node: TNode, point: DG.Point, nodeSize: number): THover | null;
}

export interface ITreeStyler<TNode extends NodeType> {
  get name(): string;

  get lineWidth(): number;

  get nodeSize(): number;

  get showGrid(): boolean;

  get strokeColor(): string;

  get fillColor(): string;

  get onStylingChanged(): rxjs.Observable<void>;

  get onTooltipShow(): rxjs.Observable<{ node: TNode | null, e: MouseEvent }>;

  fireTooltipShow(node: TNode | null, e: MouseEvent): void;
}

export class TreeStylerBase<TNode extends NodeType> implements ITreeStyler<TNode> {
  protected _name: string;
  get name(): string { return this._name; }

  protected _lineWidth: number;
  get lineWidth(): number { return this._lineWidth; }

  protected _nodeSize: number;
  get nodeSize(): number { return this._nodeSize; }

  protected _showGrid: boolean;
  get showGrid(): boolean { return this._showGrid; }

  protected _fillColor;
  get fillColor(): string { return this._fillColor; }

  protected _strokeColor;
  get strokeColor(): string { return this._strokeColor; }

  protected _onStylingChanged: rxjs.Subject<void> = new rxjs.Subject<void>();
  get onStylingChanged(): rxjs.Observable<void> { return this._onStylingChanged; }

  protected _onTooltipShow: rxjs.Subject<{ node: TNode, e: MouseEvent }> =
    new rxjs.Subject<{ node: TNode, e: MouseEvent }>();
  get onTooltipShow(): rxjs.Observable<{ node: TNode; e: MouseEvent }> { return this._onTooltipShow; }

  //  constructor();
  constructor(name?: string, lineWidth?: number, nodeSize?: number, showGrid?: boolean, strokeColor?: string, fillColor?: string) {
    this._name = name ?? '';
    this._lineWidth = lineWidth ?? 1;
    this._nodeSize = nodeSize ?? 3;
    this._showGrid = showGrid ?? false;
    this._strokeColor = strokeColor ?? '#000000';
    this._fillColor = fillColor ?? '#000000';
  }

  fireTooltipShow(node: TNode, e: MouseEvent): void {
    this._onTooltipShow.next({node, e});
  }
}

export type RenderNodeResultType<TNode extends NodeType> = { traceback: ITreeStyler<TNode>[], };
export type TraceTargetType<TNode extends NodeType> = { target: TNode, styler: ITreeStyler<TNode> };

/**
 * @param ctx
 * @param node
 * @param firstRowIndex
 * @param lastRowIndex
 * @param leftPadding
 * @param lengthRatio
 * @param stepRatio
 * @param {ITreeStyler} styler    Styler object
 * @param {number} totalLength    Total (whole) tree length (height)
 * @param currentLength
 * @param {Array} traceTargets    List of target nodes to trace back to root
 * @private
 */
export function renderNode<TNode extends MarkupNodeType>(
  ctx: CanvasRenderingContext2D, node: TNode,
  firstRowIndex: number, lastRowIndex: number,
  leftPadding: number, lengthRatio: number, stepRatio: number, styler: ITreeStyler<TNode>,
  totalLength: number, currentLength: number = 0, traceList: TraceTargetType<TNode>[]
): RenderNodeResultType<TNode> {
  const dpr: number = window.devicePixelRatio;
  const res: RenderNodeResultType<TNode> = {
    traceback: traceList.filter((t) => t.target == node).map((t) => t.styler)
  };

  const beginX = currentLength * lengthRatio + leftPadding * dpr;
  const endX = (currentLength + node.branch_length!) * lengthRatio + leftPadding * dpr;
  const posY = (node.index - firstRowIndex) * stepRatio;

  if (node.name == 'node-l1-l2') {
    console.debug('PhyloTreeViewer: renderNode() \n' +
      `node.name = ${node.name}, stylers = [${res.traceback.map((s) => s.name).join(', ')}]`);
  }

  if (firstRowIndex <= node.maxIndex && node.minIndex <= lastRowIndex) {
    //#region Plot join
    const joinMinIndex = node.children[0].index;
    const joinMaxIndex = node.children[node.children.length - 1].index;
    const posX = (currentLength + node.branch_length!) * lengthRatio + leftPadding * dpr;
    const minY = Math.max((joinMinIndex - firstRowIndex) * stepRatio, 0);
    const maxY = Math.min((joinMaxIndex - firstRowIndex) * stepRatio, ctx.canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = styler.strokeColor;
    ctx.lineWidth = styler.lineWidth * dpr;
    ctx.lineCap = 'round';
    ctx.moveTo(posX, minY);
    ctx.lineTo(posX, maxY);
    ctx.stroke();
    //#endregion

    if ((node.maxIndex - node.minIndex) * stepRatio > 1) {
      for (const childNode of node.children) {
        const childTraceList = traceList.filter((trace) => {
          return (childNode.minIndex ?? childNode.index) <= trace.target.index &&
            trace.target.index <= (childNode.maxIndex ?? childNode.index);
        });
        const childRenderRes = renderNode<TNode>(ctx, childNode as TNode,
          firstRowIndex, lastRowIndex,
          leftPadding, lengthRatio, stepRatio, styler,
          totalLength, currentLength + node.branch_length!,
          childTraceList);
        for (const effStyler of childRenderRes.traceback) {
          const childPosY = (childNode.index - firstRowIndex) * stepRatio;

          ctx.beginPath();
          ctx.strokeStyle = effStyler.strokeColor;
          ctx.lineWidth = effStyler.lineWidth * dpr;
          ctx.lineCap = 'round';
          ctx.moveTo(endX, childPosY);
          ctx.lineTo(endX, posY);
          ctx.stroke();
        }
        res.traceback.push(...childRenderRes.traceback);
      }
    } else {
      const finishX: number = node.subtreeLength! * lengthRatio + leftPadding * dpr;
      ctx.beginPath();
      ctx.strokeStyle = styler.strokeColor;
      ctx.lineWidth = styler.lineWidth * dpr;
      ctx.lineCap = 'round';
      ctx.moveTo(beginX, posY);
      ctx.lineTo(finishX, posY);
      ctx.stroke();
    }
  }

  // if (res.traceback.length > 0) {
  //   let k = 11;
  // }

  if (node.name == 'node-l1-l2-l3' && res.traceback.length > 1) {
    let k = 11;
  }

  for (const effStyler of [styler, ...res.traceback]) {
    // Draw trace
    ctx.beginPath();
    ctx.strokeStyle = effStyler.strokeColor;
    ctx.lineWidth = effStyler.lineWidth * dpr;
    ctx.lineCap = 'round';
    // ctx.moveTo(posX, childPosY);
    ctx.moveTo(endX, posY);
    ctx.lineTo(beginX, posY);
    ctx.stroke();

    //#region Plot branch
    ctx.beginPath();
    ctx.strokeStyle = effStyler.strokeColor;
    ctx.lineWidth = effStyler.lineWidth * dpr;
    ctx.lineCap = 'round';
    ctx.moveTo(endX, posY);
    ctx.lineTo(beginX, posY);
    ctx.stroke();
    //#endregion

    if (isLeaf(node)) {
      //#region Plot leaf grid
      if (effStyler.showGrid) {
        ctx.beginPath();
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.moveTo(endX, posY);
        ctx.lineTo(ctx.canvas.width, posY);
        ctx.stroke();
      }
      //#endregion

      //#region Plot leaf (marker?)
      ctx.beginPath();
      ctx.strokeStyle = effStyler.strokeColor;
      ctx.fillStyle = effStyler.fillColor;
      ctx.beginPath();
      ctx.ellipse(endX, posY, effStyler.nodeSize * dpr / 2, effStyler.nodeSize * dpr / 2,
        0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(endX, posY, effStyler.nodeSize * dpr / 2, effStyler.nodeSize * dpr / 2,
        0, 0, 2 * Math.PI);
      ctx.stroke();
      //#endregion
    }

    node.desc += effStyler.name + ', ';
  }
  return res;
}