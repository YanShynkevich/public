import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import * as rxjs from 'rxjs';

import {HoverType, ITreePlacer, MarkupNodeType} from './markup';
import {Subject} from 'rxjs';
import {NodeType} from '@datagrok-libraries/bio';

export type RectangleTreeHoverType<TNode extends NodeType> = HoverType<TNode> & {
  /** Node position along height axis */
  nodeHeight: number
};

export class RectangleTreePlacer<TNode extends MarkupNodeType> implements ITreePlacer<TNode, RectangleTreeHoverType<TNode>> {
  private _top: number;
  get top(): number { return this._top; }

  private _bottom: number;
  get bottom() { return this._bottom;}

  get height() { return this._bottom - this._top; }

  /** Tree hierarchical structure */
  private _totalLength: number;
  get totalLength() { return this._totalLength; }

  get padding() { return {left: 8, right: 8,};}

  private readonly _onChanged: rxjs.Subject<void>;

  get onPlacingChanged(): rxjs.Observable<void> { return this._onChanged; }

  constructor(top: number, bottom: number, totalLength: number) {
    this._top = top;
    this._bottom = bottom;
    this._totalLength = totalLength;

    this._onChanged = new Subject<void>();
  }

  update(params: { top?: number, bottom?: number, totalLength?: number }): void {
    let changed: boolean = false;

    if (params.top && params.top != this.top) {
      this._top = params.top;
      changed = true;
    }

    if (params.bottom && params.bottom != this.bottom) {
      this._bottom = params.bottom;
      changed = true;
    }

    if (params.totalLength && params.totalLength != this.totalLength) {
      this._totalLength = params.totalLength;
      changed = true;
    }

    if (changed)
      this._onChanged.next();
  }

  getNode(treeRoot: TNode, point: DG.Point, nodeSize: number): RectangleTreeHoverType<TNode> | null {
    function getNodeInt(
      node: MarkupNodeType, point: DG.Point, currentHeight: number
    ): RectangleTreeHoverType<TNode> | null {
      const dpr: number = window.devicePixelRatio;
      // console.debug('DendrogramTreePlacer.getNode() ' +
      //   `point = ${JSON.stringify(point)}, currentHeight = ${currentHeight}, ` +
      //   `node = ${JSON.stringify({
      //     index: node.index,
      //     minIndex: node.minIndex,
      //     maxIndex: node.maxIndex,
      //     branch_length: node.branch_length
      //   })}`);

      if (((node.minIndex ?? node.index) - 0.25) <= point.y && point.y <= ((node.maxIndex ?? node.index) + 0.25)) {
        let res: RectangleTreeHoverType<TNode> | null = null;
        const nodePoint: DG.Point = new DG.Point(currentHeight + node.branch_length!, node.index);
        if (
          (Math.abs(point.y - node.index) < 0.1 &&
            currentHeight < point.x && point.x < currentHeight + node.branch_length!) ||
          (Math.pow(nodePoint.x - point.x, 2) + Math.pow(nodePoint.y - point.y, 2)) < Math.pow(nodeSize * dpr / 2, 2)
        ) {
          res = {nodeHeight: currentHeight, node: node as TNode};
        }

        if (!res) {
          for (const childNode of (node.children ?? [])) {
            res = getNodeInt(childNode, point, currentHeight + node.branch_length!);
            if (res) break;
          }
        }

        return res;
      }

      return null;
    }

    const res = getNodeInt(treeRoot, point, 0);
    return res;
  }

  getNodeHeight(treeRoot: MarkupNodeType, node: MarkupNodeType): number | undefined {
    function getNodeHeightInt(
      currentNode: MarkupNodeType, node: MarkupNodeType, currentHeight: number
    ): number | undefined {
      let res: number | undefined = undefined;
      if (currentNode == node) {
        res = currentHeight;
      } else {
        for (const childNode of (currentNode.children ?? [])) {
          res = getNodeHeightInt(childNode, node, currentHeight + currentNode.branch_length!);
          if (res !== undefined) break;
        }
      }

      return res;
    }

    const res: number | undefined = getNodeHeightInt(treeRoot, node, 0);
    return res;
  }
}