import * as DG from 'datagrok-api/dg';
import { GridCellRendererEx } from "./GridCellRendererEx";
export declare class ClickableTextRenderer extends GridCellRendererEx {
    render(g: CanvasRenderingContext2D, nX: number, nY: number, nW: number, nH: number, cellGrid: DG.GridCell, style: DG.GridCellStyle): void;
    isClickable(cellGrid: DG.GridCell, nXOnCell: number, nYOnCell: number): boolean;
    onMouseUpEx(cellGrid: DG.GridCell, e: MouseEvent, nXOnCell: number, nYOnCell: number): void;
    onMouseMoveEx(cellGrid: DG.GridCell, e: MouseEvent, nXOnCell: number, nYOnCell: number): void;
    onMouseLeaveEx(cellGrid: DG.GridCell, e: MouseEvent, nXOnCell: number, nYOnCell: number): void;
}
//# sourceMappingURL=ClickableTextRenderer.d.ts.map