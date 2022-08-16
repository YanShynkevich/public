import * as DG from 'datagrok-api/dg';
import * as TextUtils from "./TextUtils";
/*
const canvas = ui.canvas(200*r, 300*r);

cellGrid.renderer.render(10, 10, 200, 300);

const r = window.devicePixelRatio;
x = r * x; y = r * y;
w = r * w; h = r * h;
*/
export function isRowHeader(colGrid) {
    return colGrid.idx === 0;
}
export function getInstalledGridForColumn(colGrid) {
    const dart = DG.toDart(colGrid);
    if (!(dart.m_grid instanceof DG.Grid))
        return null;
    return dart.m_grid;
}
export function installGridForColumn(grid, colGrid) {
    if (colGrid.grid instanceof DG.Grid)
        return false;
    const dart = DG.toDart(colGrid);
    if (dart.m_grid instanceof DG.Grid)
        return false;
    dart.m_grid = grid;
    return true;
}
export function setGridColumnRenderer(colGrid, renderer) {
    const dart = DG.toDart(colGrid);
    dart.m_renderer = renderer;
}
export function getGridColumnRenderer(colGrid) {
    const dart = DG.toDart(colGrid);
    const renderer = dart.m_renderer;
    if (renderer === undefined)
        return null;
    return renderer;
}
export function getGridColumnHeaderHeight(grid) {
    const options = grid.getOptions(true);
    let nHColHeader = options.look.colHeaderHeight;
    if (nHColHeader === null || nHColHeader === undefined) { //DG bug
        const cellGrid = grid.hitTest(2, 2); //.cell(col.name, 0);
        if (cellGrid !== null) {
            const rc = cellGrid.bounds;
            return rc.y;
            //console.log('rc.y ' + rc.y + " rc.h= " + rc.height + " row " + cellGrid.gridRow + " name " +  cellGrid.gridColumn.name);
        }
    }
    return nHColHeader;
}
export function getGridRowHeight(grid) {
    const options = grid.getOptions(true);
    const nHRow = options.look.rowHeight;
    if (nHRow === null || nHRow === undefined) { //DG bug
        let col = null;
        const nColCount = grid.columns.length;
        for (let nCol = 0; nCol < nColCount; ++nCol) {
            col = grid.columns.byIndex(nCol);
            if (col === null || !col.visible)
                continue;
            const cellGrid = grid.cell(col.name, 0);
            const rc = cellGrid.bounds;
            return rc.height;
        }
        return -1;
    }
    return nHRow;
}
export function getGridVisibleRowCount(grid) {
    const dframe = grid.dataFrame;
    const bitsetFilter = dframe.filter;
    const nRowCount = bitsetFilter.trueCount;
    return nRowCount;
}
export function fillVisibleViewportRows(arMinMaxRowIdxs, grid) {
    if (arMinMaxRowIdxs.length !== 2)
        throw new Error("Array to cobtain indices must have the length 2.");
    const scroll = grid.vertScroll;
    const nRowMin = Math.floor(scroll.min);
    let nRowMax = Math.ceil(scroll.max);
    const nRowCount = getGridVisibleRowCount(grid);
    if (nRowMax >= nRowCount) {
        nRowMax = nRowCount - 1;
    }
    arMinMaxRowIdxs[0] = nRowMin;
    arMinMaxRowIdxs[1] = nRowMax;
    //console.log('min: ' + scroll.min + " max: " + scroll.max + ' nRowMax ' + nRowMax + " nVisRowCount: " + nRowCount);
}
export function fillVisibleViewportGridCells(arColRowIdxs, grid) {
    if (arColRowIdxs.length !== 4)
        throw new Error("Array to cobtain bound row column indices must have the length 4.");
    const arRowIdxs = [];
    const arColIdxs = [];
    const lstVisibleCells = grid.getVisibleCells();
    for (let cellGTmp of lstVisibleCells) {
        if (!arRowIdxs.includes(cellGTmp.gridRow))
            arRowIdxs.push(cellGTmp.gridRow);
        if (!arColIdxs.includes(cellGTmp.gridColumn.idx))
            arColIdxs.push(cellGTmp.gridColumn.idx);
    }
    const nRowMin = arRowIdxs.length === 0 ? -1 : arRowIdxs[0];
    const nRowMax = arRowIdxs.length === 0 ? -2 : arRowIdxs[arRowIdxs.length - 1];
    arColRowIdxs[0] = arColIdxs.length === 0 ? -1 : arColIdxs[0];
    arColRowIdxs[1] = arColIdxs.length === 0 ? -2 : arColIdxs[arColIdxs.length - 1];
    arColRowIdxs[2] = nRowMin;
    arColRowIdxs[3] = nRowMax;
}
const m_mapScaledFonts = new Map();
export function scaleFont(font, fFactor) {
    if (fFactor === 1.0) {
        return font;
    }
    const strKey = font + fFactor.toString();
    let fontScaled = m_mapScaledFonts.get(strKey);
    if (fontScaled !== undefined)
        return fontScaled;
    const nFontSize = TextUtils.getFontSize(font);
    fontScaled = TextUtils.setFontSize(font, Math.ceil(nFontSize * fFactor));
    m_mapScaledFonts.set(strKey, fontScaled);
    return fontScaled;
}
export function paintColHeaderCell(g, nX, nY, nW, nH, colGrid) {
    if (g === null)
        return;
    g.fillStyle = "white";
    g.fillRect(nX * window.devicePixelRatio, nY * window.devicePixelRatio, nW * window.devicePixelRatio, nH * window.devicePixelRatio);
    const grid = colGrid.grid;
    const options = grid.getOptions(true);
    const font = options.look.colHeaderFont == null || options.look.colHeaderFont === undefined ? "bold 14px Volta Text, Arial" : options.look.colHeaderFont;
    const fontNew = scaleFont(font, window.devicePixelRatio);
    g.font = fontNew;
    let str = TextUtils.trimText(colGrid.name, g, nW);
    const tm = g.measureText(str);
    const nWLabel = tm.width;
    const nAscent = Math.abs(tm.actualBoundingBoxAscent);
    const nDescent = tm.actualBoundingBoxDescent;
    const nHFont = nAscent + nDescent; // + 2*nYInset;
    const nHH = nH * window.devicePixelRatio;
    g.textAlign = 'start';
    g.fillStyle = "Black";
    const nXX = nX * window.devicePixelRatio + Math.ceil(3 * window.devicePixelRatio); //((nW*window.devicePixelRatio - nWLabel) >> 1);
    const nYY = (nY * window.devicePixelRatio + nHH - Math.ceil(3 * window.devicePixelRatio)); //-2*window.devicePixelRatio);
    g.fillText(str, nXX, nYY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JpZFV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiR3JpZFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFdEMsT0FBTyxLQUFLLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFHekM7Ozs7Ozs7O0VBUUU7QUFFRixNQUFNLFVBQVUsV0FBVyxDQUFDLE9BQXVCO0lBQ2pELE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVELE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxPQUF1QjtJQUMvRCxNQUFNLElBQUksR0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLElBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUVkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNyQixDQUFDO0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUFDLElBQWMsRUFBRSxPQUF1QjtJQUMxRSxJQUFHLE9BQU8sQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLElBQUk7UUFDaEMsT0FBTyxLQUFLLENBQUM7SUFFZixNQUFNLElBQUksR0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLElBQUcsSUFBSSxDQUFDLE1BQU0sWUFBWSxFQUFFLENBQUMsSUFBSTtRQUMvQixPQUFPLEtBQUssQ0FBQztJQUVmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ25CLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUdELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxPQUF1QixFQUFFLFFBQTZCO0lBQzFGLE1BQU0sSUFBSSxHQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFD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QUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFFekIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUNyRCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUM7SUFDN0MsTUFBTSxNQUFNLEdBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFBLGVBQWU7SUFFbEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUV2QyxDQUFDLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN0QixDQUFDLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN0QixNQUFNLEdBQUcsR0FBRyxFQUFFLEdBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUEsZ0RBQWdEO0lBQzlILE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFBLDhCQUE4QjtJQUNwSCxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIERHIGZyb20gJ2RhdGFncm9rLWFwaS9kZyc7XHJcbmltcG9ydCB7R3JpZENlbGxSZW5kZXJlckV4fSBmcm9tIFwiLi4vcmVuZGVyZXIvR3JpZENlbGxSZW5kZXJlckV4XCI7XHJcbmltcG9ydCAqIGFzIFRleHRVdGlscyBmcm9tIFwiLi9UZXh0VXRpbHNcIjtcclxuaW1wb3J0ICogYXMgR3JpZFV0aWxzIGZyb20gJy4uL3V0aWxzL0dyaWRVdGlscyc7XHJcblxyXG4vKlxyXG5jb25zdCBjYW52YXMgPSB1aS5jYW52YXMoMjAwKnIsIDMwMCpyKTtcclxuXHJcbmNlbGxHcmlkLnJlbmRlcmVyLnJlbmRlcigxMCwgMTAsIDIwMCwgMzAwKTtcclxuXHJcbmNvbnN0IHIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcclxueCA9IHIgKiB4OyB5ID0gciAqIHk7XHJcbncgPSByICogdzsgaCA9IHIgKiBoO1xyXG4qL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzUm93SGVhZGVyKGNvbEdyaWQgOiBERy5HcmlkQ29sdW1uKSA6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBjb2xHcmlkLmlkeCA9PT0gMDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RhbGxlZEdyaWRGb3JDb2x1bW4oY29sR3JpZCA6IERHLkdyaWRDb2x1bW4pIDogREcuR3JpZCB8IG51bGwge1xyXG4gIGNvbnN0IGRhcnQgOiBhbnkgPSBERy50b0RhcnQoY29sR3JpZCk7XHJcbiAgaWYoIShkYXJ0Lm1fZ3JpZCBpbnN0YW5jZW9mIERHLkdyaWQpKVxyXG4gICAgcmV0dXJuIG51bGw7XHJcblxyXG4gIHJldHVybiBkYXJ0Lm1fZ3JpZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxHcmlkRm9yQ29sdW1uKGdyaWQgOiBERy5HcmlkLCBjb2xHcmlkIDogREcuR3JpZENvbHVtbikgOiBib29sZWFuIHtcclxuICBpZihjb2xHcmlkLmdyaWQgaW5zdGFuY2VvZiBERy5HcmlkKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICBjb25zdCBkYXJ0IDogYW55ID0gREcudG9EYXJ0KGNvbEdyaWQpO1xyXG4gIGlmKGRhcnQubV9ncmlkIGluc3RhbmNlb2YgREcuR3JpZClcclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgZGFydC5tX2dyaWQgPSBncmlkO1xyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEdyaWRDb2x1bW5SZW5kZXJlcihjb2xHcmlkIDogREcuR3JpZENvbHVtbiwgcmVuZGVyZXIgOiBHcmlkQ2VsbFJlbmRlcmVyRXgpIDogdm9pZCB7XHJcbiAgY29uc3QgZGFydCA6IGFueSA9IERHLnRvRGFydChjb2xHcmlkKTtcclxuICBkYXJ0Lm1fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEdyaWRDb2x1bW5SZW5kZXJlcihjb2xHcmlkIDogREcuR3JpZENvbHVtbikgOiBHcmlkQ2VsbFJlbmRlcmVyRXggfCBudWxsIHtcclxuICBjb25zdCBkYXJ0IDogYW55ID0gREcudG9EYXJ0KGNvbEdyaWQpO1xyXG4gIGNvbnN0IHJlbmRlcmVyID0gZGFydC5tX3JlbmRlcmVyO1xyXG4gIGlmKHJlbmRlcmVyID09PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgcmV0dXJuIHJlbmRlcmVyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JpZENvbHVtbkhlYWRlckhlaWdodChncmlkIDogREcuR3JpZCkgOiBudW1iZXIge1xyXG4gIGNvbnN0IG9wdGlvbnMgOiBhbnkgPSBncmlkLmdldE9wdGlvbnModHJ1ZSk7XHJcbiAgbGV0IG5IQ29sSGVhZGVyID0gb3B0aW9ucy5sb29rLmNvbEhlYWRlckhlaWdodDtcclxuICBpZihuSENvbEhlYWRlciA9PT0gbnVsbCB8fCBuSENvbEhlYWRlciA9PT0gdW5kZWZpbmVkKSB7Ly9ERyBidWdcclxuXHJcbiAgICBjb25zdCBjZWxsR3JpZCA9IGdyaWQuaGl0VGVzdCgyLDIpOy8vLmNlbGwoY29sLm5hbWUsIDApO1xyXG4gICAgaWYoY2VsbEdyaWQgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgcmMgPSBjZWxsR3JpZC5ib3VuZHM7XHJcbiAgICAgIHJldHVybiByYy55O1xyXG4gICAgICAvL2NvbnNvbGUubG9nKCdyYy55ICcgKyByYy55ICsgXCIgcmMuaD0gXCIgKyByYy5oZWlnaHQgKyBcIiByb3cgXCIgKyBjZWxsR3JpZC5ncmlkUm93ICsgXCIgbmFtZSBcIiArICBjZWxsR3JpZC5ncmlkQ29sdW1uLm5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gbkhDb2xIZWFkZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRHcmlkUm93SGVpZ2h0KGdyaWQgOiBERy5HcmlkKSA6IG51bWJlciB7XHJcbiAgY29uc3Qgb3B0aW9ucyA6IGFueSA9IGdyaWQuZ2V0T3B0aW9ucyh0cnVlKTtcclxuICBjb25zdCBuSFJvdyA9ICBvcHRpb25zLmxvb2sucm93SGVpZ2h0O1xyXG4gIGlmKG5IUm93ID09PSBudWxsIHx8IG5IUm93ID09PSB1bmRlZmluZWQpIHsvL0RHIGJ1Z1xyXG4gICAgbGV0IGNvbCA9IG51bGw7XHJcbiAgICBjb25zdCBuQ29sQ291bnQgPSBncmlkLmNvbHVtbnMubGVuZ3RoO1xyXG4gICAgZm9yKGxldCBuQ29sPTA7IG5Db2w8bkNvbENvdW50OyArK25Db2wpIHtcclxuICAgICAgY29sID0gZ3JpZC5jb2x1bW5zLmJ5SW5kZXgobkNvbCk7XHJcbiAgICAgIGlmKGNvbCA9PT0gbnVsbCB8fCAhY29sLnZpc2libGUpXHJcbiAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICBjb25zdCBjZWxsR3JpZCA9IGdyaWQuY2VsbChjb2wubmFtZSwgMCk7XHJcbiAgICAgIGNvbnN0IHJjID0gY2VsbEdyaWQuYm91bmRzO1xyXG4gICAgICByZXR1cm4gcmMuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5IUm93O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JpZFZpc2libGVSb3dDb3VudChncmlkIDogREcuR3JpZCkgOiBudW1iZXIge1xyXG4gIGNvbnN0IGRmcmFtZSA9IGdyaWQuZGF0YUZyYW1lO1xyXG4gIGNvbnN0IGJpdHNldEZpbHRlciA9IGRmcmFtZS5maWx0ZXI7XHJcbiAgY29uc3QgblJvd0NvdW50ID0gYml0c2V0RmlsdGVyLnRydWVDb3VudDtcclxuICByZXR1cm4gblJvd0NvdW50O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmlsbFZpc2libGVWaWV3cG9ydFJvd3MoYXJNaW5NYXhSb3dJZHhzIDogQXJyYXk8bnVtYmVyPiwgZ3JpZCA6IERHLkdyaWQpIDogdm9pZCB7XHJcbiAgaWYoYXJNaW5NYXhSb3dJZHhzLmxlbmd0aCAhPT0gMilcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkFycmF5IHRvIGNvYnRhaW4gaW5kaWNlcyBtdXN0IGhhdmUgdGhlIGxlbmd0aCAyLlwiKTtcclxuXHJcbiAgY29uc3Qgc2Nyb2xsID0gZ3JpZC52ZXJ0U2Nyb2xsO1xyXG4gIGNvbnN0IG5Sb3dNaW4gPSBNYXRoLmZsb29yKHNjcm9sbC5taW4pO1xyXG4gIGxldCBuUm93TWF4ID0gTWF0aC5jZWlsKHNjcm9sbC5tYXgpO1xyXG4gIGNvbnN0IG5Sb3dDb3VudCA9IGdldEdyaWRWaXNpYmxlUm93Q291bnQoZ3JpZCk7XHJcbiAgaWYoblJvd01heCA+PSBuUm93Q291bnQpIHtcclxuICAgIG5Sb3dNYXggPSBuUm93Q291bnQgLTE7XHJcbiAgfVxyXG5cclxuICBhck1pbk1heFJvd0lkeHNbMF0gPSBuUm93TWluO1xyXG4gIGFyTWluTWF4Um93SWR4c1sxXSA9IG5Sb3dNYXg7XHJcbiAgLy9jb25zb2xlLmxvZygnbWluOiAnICsgc2Nyb2xsLm1pbiArIFwiIG1heDogXCIgKyBzY3JvbGwubWF4ICsgJyBuUm93TWF4ICcgKyBuUm93TWF4ICsgXCIgblZpc1Jvd0NvdW50OiBcIiArIG5Sb3dDb3VudCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaWxsVmlzaWJsZVZpZXdwb3J0R3JpZENlbGxzKGFyQ29sUm93SWR4cyA6IEFycmF5PG51bWJlcj4sIGdyaWQgOiBERy5HcmlkKVxyXG57XHJcbiAgaWYoYXJDb2xSb3dJZHhzLmxlbmd0aCAhPT0gNClcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkFycmF5IHRvIGNvYnRhaW4gYm91bmQgcm93IGNvbHVtbiBpbmRpY2VzIG11c3QgaGF2ZSB0aGUgbGVuZ3RoIDQuXCIpO1xyXG5cclxuICBjb25zdCBhclJvd0lkeHMgOiBBcnJheTxudW1iZXI+ID0gW107XHJcbiAgY29uc3QgYXJDb2xJZHhzIDogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG4gIGNvbnN0IGxzdFZpc2libGVDZWxscyA9IGdyaWQuZ2V0VmlzaWJsZUNlbGxzKCk7XHJcbiAgZm9yKGxldCBjZWxsR1RtcCBvZiBsc3RWaXNpYmxlQ2VsbHMpXHJcbiAge1xyXG4gICAgaWYoIWFyUm93SWR4cy5pbmNsdWRlcyhjZWxsR1RtcC5ncmlkUm93KSlcclxuICAgICAgYXJSb3dJZHhzLnB1c2goY2VsbEdUbXAuZ3JpZFJvdyk7XHJcblxyXG4gICAgaWYoIWFyQ29sSWR4cy5pbmNsdWRlcyhjZWxsR1RtcC5ncmlkQ29sdW1uLmlkeCkpXHJcbiAgICAgIGFyQ29sSWR4cy5wdXNoKGNlbGxHVG1wLmdyaWRDb2x1bW4uaWR4KTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG5Sb3dNaW4gPSBhclJvd0lkeHMubGVuZ3RoID09PSAwID8gLTEgOiBhclJvd0lkeHNbMF07XHJcbiAgY29uc3QgblJvd01heCA9IGFyUm93SWR4cy5sZW5ndGggPT09IDAgPyAtMiA6IGFyUm93SWR4c1thclJvd0lkeHMubGVuZ3RoLTFdO1xyXG5cclxuICBhckNvbFJvd0lkeHNbMF0gPSBhckNvbElkeHMubGVuZ3RoID09PSAwID8gLTEgOiBhckNvbElkeHNbMF07XHJcbiAgYXJDb2xSb3dJZHhzWzFdID0gYXJDb2xJZHhzLmxlbmd0aCA9PT0gMCA/IC0yIDogYXJDb2xJZHhzW2FyQ29sSWR4cy5sZW5ndGggLTFdO1xyXG4gIGFyQ29sUm93SWR4c1syXSA9IG5Sb3dNaW47XHJcbiAgYXJDb2xSb3dJZHhzWzNdID0gblJvd01heDtcclxufVxyXG5cclxuY29uc3QgbV9tYXBTY2FsZWRGb250cyA9IG5ldyBNYXAoKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUZvbnQoZm9udCA6IHN0cmluZywgZkZhY3RvciA6IG51bWJlcikgOiBzdHJpbmcge1xyXG4gIGlmKGZGYWN0b3IgPT09IDEuMCkge1xyXG4gICAgcmV0dXJuIGZvbnQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzdHJLZXkgPSBmb250ICsgZkZhY3Rvci50b1N0cmluZygpO1xyXG4gIGxldCBmb250U2NhbGVkID0gbV9tYXBTY2FsZWRGb250cy5nZXQoc3RyS2V5KTtcclxuICBpZihmb250U2NhbGVkICE9PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm4gZm9udFNjYWxlZDtcclxuXHJcbiAgY29uc3QgbkZvbnRTaXplIDogbnVtYmVyID0gVGV4dFV0aWxzLmdldEZvbnRTaXplKGZvbnQpO1xyXG4gIGZvbnRTY2FsZWQgPSBUZXh0VXRpbHMuc2V0Rm9udFNpemUoZm9udCwgTWF0aC5jZWlsKG5Gb250U2l6ZSAqIGZGYWN0b3IpKTtcclxuICBtX21hcFNjYWxlZEZvbnRzLnNldChzdHJLZXksIGZvbnRTY2FsZWQpO1xyXG5cclxuICByZXR1cm4gZm9udFNjYWxlZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhaW50Q29sSGVhZGVyQ2VsbChnIDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCwgblggOiBudW1iZXIsIG5ZIDogbnVtYmVyLCBuVzogbnVtYmVyLCBuSDogbnVtYmVyLCBjb2xHcmlkIDogREcuR3JpZENvbHVtbikge1xyXG5cclxuICBpZihnID09PSBudWxsKVxyXG4gICAgcmV0dXJuO1xyXG5cclxuICBnLmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICBnLmZpbGxSZWN0KG5YKndpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLCBuWSp3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbywgblcqd2luZG93LmRldmljZVBpeGVsUmF0aW8sIG5IKndpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcclxuXHJcbiAgY29uc3QgZ3JpZCA9IGNvbEdyaWQuZ3JpZDtcclxuICBjb25zdCBvcHRpb25zIDogYW55ID0gZ3JpZC5nZXRPcHRpb25zKHRydWUpO1xyXG5cclxuICBjb25zdCBmb250ID0gb3B0aW9ucy5sb29rLmNvbEhlYWRlckZvbnQgPT0gbnVsbCB8fCBvcHRpb25zLmxvb2suY29sSGVhZGVyRm9udCA9PT0gdW5kZWZpbmVkID8gXCJib2xkIDE0cHggVm9sdGEgVGV4dCwgQXJpYWxcIiA6IG9wdGlvbnMubG9vay5jb2xIZWFkZXJGb250O1xyXG4gIGNvbnN0IGZvbnROZXcgPSBzY2FsZUZvbnQoZm9udCwgd2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xyXG4gIGcuZm9udCA9IGZvbnROZXc7XHJcblxyXG4gIGxldCBzdHIgPSBUZXh0VXRpbHMudHJpbVRleHQoY29sR3JpZC5uYW1lLCBnLCBuVyk7XHJcblxyXG4gIGNvbnN0IHRtID0gZy5tZWFzdXJlVGV4dChzdHIpO1xyXG4gIGNvbnN0IG5XTGFiZWwgPSB0bS53aWR0aDtcclxuXHJcbiAgY29uc3QgbkFzY2VudCA9IE1hdGguYWJzKHRtLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50KTtcclxuICBjb25zdCBuRGVzY2VudCA9IHRtLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudDtcclxuICBjb25zdCBuSEZvbnQgPSAgbkFzY2VudCArIG5EZXNjZW50Oy8vICsgMipuWUluc2V0O1xyXG5cclxuICBjb25zdCBuSEggPSBuSCp3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgZy50ZXh0QWxpZ24gPSAnc3RhcnQnO1xyXG4gIGcuZmlsbFN0eWxlID0gXCJCbGFja1wiO1xyXG4gIGNvbnN0IG5YWCA9IG5YKndpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICsgTWF0aC5jZWlsKDMqd2luZG93LmRldmljZVBpeGVsUmF0aW8pOy8vKChuVyp3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAtIG5XTGFiZWwpID4+IDEpO1xyXG4gIGNvbnN0IG5ZWSA9IChuWSp3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyArIG5ISCAtIE1hdGguY2VpbCgzKndpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKSk7Ly8tMip3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyk7XHJcbiAgZy5maWxsVGV4dChzdHIsIG5YWCwgbllZKTtcclxufVxyXG4iXX0=