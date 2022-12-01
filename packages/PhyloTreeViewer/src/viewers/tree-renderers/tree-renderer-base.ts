import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import {isLeaf, NodeType} from '@datagrok-libraries/bio';
import * as rxjs from 'rxjs';
import {GridTreeRendererBase} from '../grid-tree-renderer';
import {Unsubscribable} from 'rxjs';
import {RectangleTreeHoverType} from './rectangle-tree-placer';

export type TreeRendererEventArgsType<TNode extends NodeType> = {
  target: TreeRendererBase<TNode>,
  context: CanvasRenderingContext2D,
  lengthRatio: number,
};


export abstract class TreeRendererBase<TNode extends NodeType> {

  public view?: HTMLElement;

  private _treeRoot: TNode;
  get treeRoot(): TNode { return this._treeRoot; }

  set treeRoot(value: TNode) {
    this._treeRoot = value;
    this.render();
  }

  protected _hoveredNode: TNode | null;
  get hoveredNode(): TNode | null { return this._hoveredNode; }

  protected _onHoverChanged: rxjs.Subject<void> = new rxjs.Subject<void>();
  get onHoverChanged(): rxjs.Observable<void> { return this._onHoverChanged; };

  protected _selectedNodes: TNode[] = [];
  get selectedNodes(): TNode[] { return this._selectedNodes; }

  protected _onSelectedChanged: rxjs.Subject<void> = new rxjs.Subject<void>();
  get onSelectedChanged(): rxjs.Observable<void> { return this._onSelectedChanged; }

  protected subs: Unsubscribable[] = [];

  protected constructor(treeRoot: TNode) {
    this._treeRoot = treeRoot;

    this._onAfterRender = new rxjs.Subject<TreeRendererEventArgsType<TNode>>();

    // initial render
    window.setTimeout(this.render.bind(this), 0 /* next event cycle */);
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

  protected readonly _onAfterRender: rxjs.Subject<TreeRendererEventArgsType<TNode>>;

  get onAfterRender(): rxjs.Observable<TreeRendererEventArgsType<TNode>> { return this._onAfterRender; }

  // -- Handle events --

  private viewOnSizeChanged(): void {
    console.debug('PhyloTreeViewer: TreeRendererBase.viewOnSizeChanged()');

    this.render();
  }
}

