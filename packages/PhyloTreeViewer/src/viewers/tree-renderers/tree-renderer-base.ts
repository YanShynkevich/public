import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import {isLeaf, NodeType} from '@datagrok-libraries/bio';
import * as rxjs from 'rxjs';
import {GridTreeRendererBase} from '../grid-tree-renderer';
import {Unsubscribable} from 'rxjs';
import {RectangleTreeHoverType} from './rectangle-tree-placer';
import {HoverType, MarkupNodeType} from './markup';

export type TreeRendererEventArgsType<TNode extends NodeType, THover extends HoverType<TNode>> = {
  target: TreeRendererBase<TNode, THover>,
  context: CanvasRenderingContext2D,
  lengthRatio: number,
};


export abstract class TreeRendererBase<TNode extends NodeType, THover extends HoverType<TNode>> {

  public view?: HTMLElement;

  private _treeRoot: TNode;
  get treeRoot(): TNode { return this._treeRoot; }

  set treeRoot(value: TNode) {
    this._treeRoot = value;
    this.render();
  }

  protected _hoveredNode: TNode | null;

  protected _onHoverChanged: rxjs.Subject<void> = new rxjs.Subject<void>();
  get onHoverChanged(): rxjs.Observable<void> { return this._onHoverChanged; };

  protected _selectedNodes: TNode[] = [];
  get selectedNodes(): TNode[] { return this._selectedNodes; }

  protected _onSelectionChanged: rxjs.Subject<void> = new rxjs.Subject<void>();
  get onSelectionChanged(): rxjs.Observable<void> { return this._onSelectionChanged; }

  private _hover: THover | null;
  public get hover(): THover | null { return this._hover; }

  public set hover(value: THover | null) {
    this._hover = value;
    this.render();
    this._onHoverChanged.next();
  }

  private _selections: THover[] = [];
  public get selections(): THover[] { return this._selections; }

  public set selections(value: THover[]) {
    this._selections = value;
    this._selectedNodes = this._selections.map((h) => h.node);
    this.render();
    this._onSelectionChanged.next();
  }

  protected subs: Unsubscribable[] = [];

  protected constructor(treeRoot: TNode) {
    this._treeRoot = treeRoot;

    this._onAfterRender = new rxjs.Subject<TreeRendererEventArgsType<TNode, THover>>();
  }

  // -- View --

  public attach(view: HTMLElement): void {
    this.view = view;
    this.subs.push(ui.onSizeChanged(this.view).subscribe(this.viewOnSizeChanged.bind(this)));

    // Postponed call to initial render after attach completed (e.g. canvas created)
    window.setTimeout(() => { this.render(); }, 0 /* next event cycle */);
  }

  public detach(): void {
    for (const sub of this.subs) sub.unsubscribe();
    delete this.view;
  }

  public abstract render(): void;

  protected readonly _onAfterRender: rxjs.Subject<TreeRendererEventArgsType<TNode, THover>>;

  get onAfterRender(): rxjs.Observable<TreeRendererEventArgsType<TNode, THover>> { return this._onAfterRender; }

  // -- Handle events --

  private viewOnSizeChanged(): void {
    console.debug('PhyloTreeViewer: TreeRendererBase.viewOnSizeChanged()');

    this.render();
  }
}

