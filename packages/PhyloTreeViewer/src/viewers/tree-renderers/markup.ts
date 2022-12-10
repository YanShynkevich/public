import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import * as rxjs from 'rxjs';

import {isLeaf, NodeType} from '@datagrok-libraries/bio';

/** Markup node for node and its subtree place on axis of leaves. */
export type MarkupNodeType = NodeType & {
  children: MarkupNodeType[],
  index: number,
  minIndex: number,
  maxIndex: number,
  /** node's branch_length with max subtreeLength of children */
  subtreeLength?: number,
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
  console.debug('PhyloTreeViewer: LeafRangeTreeRenderer.markupNode() ' + `ET: ${((t2 - t1) / 1000).toString()} s`);
}

export type HoverType<TNode> = { node: TNode };

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

export interface ITreeStyler {
  get lineWidth(): number;

  get nodeSize(): number;

  get showGrid(): boolean;

  get strokeColor(): string;

  get fillColor(): string;

  get onStylingChanged(): rxjs.Observable<void>;
}

/**
 * @param ctx
 * @param node
 * @param firstRowIndex
 * @param lastRowIndex
 * @param leftPadding
 * @param lengthRatio
 * @param stepRatio
 * @param {number} totalLength Total (whole) tree length (height)
 * @param currentLength
 * @private
 */
export function renderNode<TNode extends MarkupNodeType>(
  ctx: CanvasRenderingContext2D, node: TNode,
  firstRowIndex: number, lastRowIndex: number,
  leftPadding: number, lengthRatio: number, stepRatio: number, styler: ITreeStyler,
  totalLength: number, currentLength: number = 0
) {
  const r: number = window.devicePixelRatio;

  if (isLeaf(node)) {
    if (firstRowIndex <= node.index && node.index <= lastRowIndex) {
      const minX = currentLength * lengthRatio + leftPadding * r;
      const maxX = (currentLength + node.branch_length!) * lengthRatio + leftPadding * r;

      const posY = (node.index - firstRowIndex) * stepRatio;
      if (styler.showGrid) {
        // plot leaf grid
        ctx.beginPath();
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.moveTo(maxX, posY);
        ctx.lineTo(ctx.canvas.width, posY);
        ctx.stroke();
      }

      // plot branch
      ctx.beginPath();
      ctx.strokeStyle = styler.strokeColor;
      ctx.lineWidth = styler.lineWidth;
      ctx.lineCap = 'round';
      ctx.moveTo(minX, posY);
      ctx.lineTo(maxX, posY);
      ctx.stroke();


      // plot leaf (marker?)
      ctx.beginPath();
      ctx.fillStyle = styler.fillColor;
      ctx.ellipse(maxX, posY, styler.nodeSize / 2, styler.nodeSize / 2,
        0, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else {
    if (firstRowIndex <= node.maxIndex && node.minIndex <= lastRowIndex) {
      for (const childNode of node.children) {
        renderNode(ctx, childNode,
          firstRowIndex, lastRowIndex,
          leftPadding, lengthRatio, stepRatio, styler,
          totalLength, currentLength + node.branch_length!);
      }

      // plot join
      const joinMinIndex = node.children[0].index;
      const joinMaxIndex = node.children[node.children.length - 1].index;
      const posX = (currentLength + node.branch_length!) * lengthRatio + leftPadding * r;
      const minY = Math.max((joinMinIndex - firstRowIndex) * stepRatio, 0);
      const maxY = Math.min((joinMaxIndex - firstRowIndex) * stepRatio, ctx.canvas.height);
      //

      ctx.beginPath();
      ctx.strokeStyle = styler.strokeColor;
      ctx.lineWidth = styler.lineWidth;
      ctx.lineCap = 'round';
      ctx.moveTo(posX, minY);
      ctx.lineTo(posX, maxY);
      ctx.stroke();

      const minX = currentLength * lengthRatio + leftPadding * r;
      const maxX = (currentLength + node.branch_length!) * lengthRatio + leftPadding * r;
      const posY = (node.index - firstRowIndex) * stepRatio;

      ctx.beginPath();
      ctx.strokeStyle = styler.strokeColor;
      ctx.lineWidth = styler.lineWidth;
      ctx.lineCap = 'round';
      ctx.moveTo(minX, posY);
      ctx.lineTo(maxX, posY);
      ctx.stroke();
    }
  }
}