import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import * as rxjs from 'rxjs';

import {StringDictionary} from '@datagrok-libraries/utils/src/type-declarations';

import {Aminoacids, AminoacidsPalettes} from '../aminoacids';
import {Nucleotides, NucleotidesPalettes} from '../nucleotides';
import {SeqPalette} from '../seq-palettes';

// Using color schemes from chem-palette

declare module 'datagrok-api/src/grid' {
  interface Rect {
    contains(x: number, y: number): boolean;
  }
}

declare global {
  interface HTMLCanvasElement {
    getCursorPosition(event: MouseEvent): DG.Point;
  }
}

HTMLCanvasElement.prototype.getCursorPosition = function(event: MouseEvent): DG.Point {
  const rect = this.getBoundingClientRect();
  return new DG.Point(event.clientX - rect.left, event.clientY - rect.top);
};

DG.Rect.prototype.contains = function(x: number, y: number): boolean {
  return this.left <= x && x <= this.right && this.top <= y && y <= this.bottom;
};

export class PositionMonomerInfo {
  /** Sequences count with monomer in position
   */
  count: number;

  /** Remember screen coords rect
   */
  bounds: DG.Rect;

  constructor() {
    this.count = 0;
    this.bounds = new DG.Rect(0, 0, 0, 0);
  }
}

export class PositionInfo {
  public readonly name: string;
  freq: { [m: string]: PositionMonomerInfo };
  rowCount: number;

  /** freq = {}, rowCount = 0
   * @param {string} name Name of position ('111A', '111.1', etc)
   */
  constructor(name: string) {
    this.name = name;
    this.freq = {};
    this.rowCount = 0;
  }
}

export class WebLogo extends DG.JsViewer {
  public static residuesSet = 'nucleotides';

  private initialized: boolean = false;

  // private readonly colorScheme: ColorScheme = ColorSchemes[NucleotidesWebLogo.residuesSet];
  protected cp: SeqPalette | null = null;

  private host?: HTMLDivElement;
  private msgHost?: HTMLElement;
  private canvas?: HTMLCanvasElement;
  private slider?: DG.RangeSlider;
  private textBaseline: CanvasTextBaseline;

  private axisHeight: number = 12;

  private seqCol: DG.Column | null = null;
  // private maxLength: number = 100;
  private positions: PositionInfo[] = [];

  private rowsMasked: number = 0;
  private rowsNull: number = 0;

  // Viewer's properties (likely they should be public so that they can be set outside)
  public positionWidth: number;
  public minHeight: number;
  public maxHeight: number;
  public considerNullSequences: boolean;
  public sequenceColumnName: string | null;
  public startPositionName: string | null;
  public endPositionName: string | null;
  public fixWidth: boolean;
  public verticalAlignment: string | null;
  public horizontalAlignment: string | null;

  private positionNames: string[] = [];

  private startPosition: number = -1;

  private endPosition: number = -1;

  /** For startPosition equals to endPosition Length is 1 */
  private get Length(): number {
    return this.startPosition <= this.endPosition ? this.endPosition - this.startPosition + 1 : 0;
  }

  constructor() {
    super();

    this.textBaseline = 'top';

    this.positionWidth = this.float('positionWidth', 16/*,
      {editor: 'slider', min: 4, max: 64, postfix: 'px'}*/);
    this.minHeight = this.float('minHeight', 50/*,
      {editor: 'slider', min: 25, max: 250, postfix: 'px'}*/);
    this.maxHeight = this.float('maxHeight', 100/*,
      {editor: 'slider', min: 25, max: 500, postfix: 'px'}*/);

    this.considerNullSequences = this.bool('considerNullSequences', false);
    this.sequenceColumnName = this.string('sequenceColumnName', null);

    this.startPositionName = this.string('startPositionName', null);
    this.endPositionName = this.string('endPositionName', null);

    this.fixWidth = this.bool('fixWidth', false);

    this.verticalAlignment = this.string('verticalAlignment', 'middle',
      {choices: ['top', 'middle', 'bottom']});
    this.horizontalAlignment = this.string('horizontalAlignment', 'center',
      {choices: ['left', 'center', 'right']});
  }

  private async init(): Promise<void> {
    if (this.initialized)
      alert('WebLogo second initialization!');

    this.initialized = true;
    this.helpUrl = '/help/visualize/viewers/web-logo.md';

    this.msgHost = ui.div('No message');
    this.msgHost.style.display = 'none';

    this.canvas = ui.canvas();
    this.canvas.style.width = '100%';

    this.host = ui.div([this.msgHost, this.canvas]);

    // this.slider = ui.rangeSlider(0, 20, 2, 5);
    // this.slider.root.style.width = '100%';
    // this.slider.root.style.height = '12px';

    const getMonomer = (p: DG.Point): [number, string | null, PositionMonomerInfo | null] => {
      const jPos = Math.floor(p.x / this.positionWidth);
      const position = this.positions[jPos];

      if (position === void 0)
        return [jPos, null, null];

      const monomer: string | undefined = Object.keys(position.freq)
        .find((m) => position.freq[m].bounds.contains(p.x, p.y));
      if (monomer === undefined)
        return [jPos, null, null];

      return [jPos, monomer, position.freq[monomer]];
    };

    this.canvas.onmouseover = (e: MouseEvent) => {

    };

    this.subs.push(rxjs.fromEvent<MouseEvent>(this.canvas, 'mousemove').subscribe((e: MouseEvent) => {
      if (!this.canvas)
        return;

      const args = e as MouseEvent;
      const [jPos, monomer] = getMonomer(this.canvas.getCursorPosition(args));

      if (this.dataFrame && this.seqCol && monomer) {
        ui.tooltip.showRowGroup(this.dataFrame, (iRow) => {
          const seq = this.seqCol!.get(iRow);
          const mSeq = seq ? seq[this.startPosition + jPos] : null;
          return mSeq === monomer;
        }, args.x + 16, args.y + 16);
      } else {
        ui.tooltip.hide();
      }
    }));

    this.subs.push(rxjs.fromEvent<MouseEvent>(this.canvas, 'mousedown').subscribe((e: MouseEvent) => {
      if (!this.canvas || e.button != 0)
        return;

      const args = e as MouseEvent;
      const [jPos, monomer] = getMonomer(this.canvas.getCursorPosition(args));

      // prevents deselect all rows if we miss monomer bounds
      if (this.dataFrame && this.seqCol && monomer) {
        this.dataFrame.selection.init((iRow) => {
          const seq = this.seqCol!.get(iRow);
          const mSeq = seq ? seq[this.startPosition + jPos] : null;
          return mSeq === monomer;
        });
      }
    }));

    this.subs.push(ui.onSizeChanged(this.root).subscribe(this.rootOnSizeChanged.bind(this)));

    this.root.append(this.host);
    // this.root.appendChild(this.slider.root);

    this.render(true);
  }

  rootOnSizeChanged(args: any) {
    this.render(true);

    // console.debug(`WebLogo.onRootSizeChanged() ` +
    //   `root.width=${this.root.clientWidth}, root.height=${this.root.clientHeight}, ` +
    //   `canvas.width=${this.canvas.width}, canvas.height=${this.canvas.height} .`);
  }

  /** Assigns {@link seqCol} and {@link cp} based on {@link sequenceColumnName} and calls {@link render}().
   */
  updateSeqCol(): void {
    if (this.dataFrame) {
      this.seqCol = this.sequenceColumnName ? this.dataFrame.col(this.sequenceColumnName) : null;
      if (this.seqCol == null) {
        this.seqCol = this.pickUpSeqCol(this.dataFrame);
        this.sequenceColumnName = this.seqCol ? this.seqCol.name : null;
      }
      if (this.seqCol) {
        const maxLength = Math.max(...this.seqCol.categories.map((s) => s.length));

        // Get position names from data column tag 'positionNames'
        const positionNamesTxt = this.seqCol.getTag('positionNames');
        // Fallback if 'positionNames' tag is not provided
        this.positionNames = positionNamesTxt ? positionNamesTxt.split(', ').map((n) => n.trim()) :
          [...Array(maxLength).keys()].map((jPos) => `${jPos + 1}`);

        this.startPosition = this.startPositionName && this.positionNames ?
          this.positionNames.indexOf(this.startPositionName) : 0;
        this.endPosition = this.endPositionName && this.positionNames ?
          this.positionNames.indexOf(this.endPositionName) : (maxLength - 1);

        this.cp = this.pickUpPalette(this.seqCol);
      } else {
        this.cp = null;
        this.positionNames = [];
        this.startPosition = -1;
        this.endPosition = -1;
      }
    }
    this.render();
  }

  onPropertyChanged(property: DG.Property): void {
    // console.debug(`WebLogo.onPropertyChanged( ${property.name} = '' })`);
    super.onPropertyChanged(property);

    switch (property.name) {
    case 'considerNullSequences':
      this.render(true);
      break;
    case 'sequenceColumnName':
      this.updateSeqCol();
      break;
    case 'startPositionName':
      this.updateSeqCol();
      break;
    case 'endPositionName':
      this.updateSeqCol();
      break;
    case 'positionWidth':
      this.render(true);
      break;
    case 'minHeight':
      this.render(true);
      break;
    case 'maxHeight':
      this.render(true);
      break;
    case 'fixWidth':
      this.render(true);
      break;
    case 'verticalAlignment':
      this.render(true);
      break;
    case 'horizontalAlignment':
      this.render(true);
      break;
    }
  }

  async onTableAttached() {
    // console.debug(`WebLogo.onTableAttached( dataFrame = ${this.dataFrame ? 'data' : 'null'} )`);
    this.updateSeqCol();

    if (this.dataFrame !== void 0) {
      this.subs.push(this.dataFrame.selection.onChanged.subscribe((_) => this.render()));
      this.subs.push(this.dataFrame.filter.onChanged.subscribe((_) => this.render()));
    }

    await this.init();
  }

  protected _nullSequence(fillerResidue = 'X'): string {
    if (this.considerNullSequences)
      return new Array(this.Length).fill(fillerResidue).join('');

    return '';
  }

  protected _calculate() {
    if (!this.canvas || !this.host || !this.seqCol || !this.dataFrame ||
      this.startPosition === -1 || this.endPosition === -1)
      return;

    this.calcSize();

    this.positions = new Array(this.Length);
    for (let jPos = 0; jPos < this.Length; jPos++) {
      const posName: string = this.positionNames[this.startPosition + jPos];
      this.positions[jPos] = new PositionInfo(posName);
    }

    // 2022-05-05 askalkin instructed to show WebLogo based on filter (not selection)
    const indices = this.dataFrame.filter.getSelectedIndexes();
    // const indices = this.dataFrame.selection.trueCount > 0 ? this.dataFrame.selection.getSelectedIndexes() :
    //   this.dataFrame.filter.getSelectedIndexes();

    this.rowsMasked = indices.length;
    this.rowsNull = 0;

    for (const i of indices) {
      let s: string = <string>(this.seqCol.get(i));

      if (!s) {
        s = this._nullSequence();
        ++this.rowsNull;
      } else {
        for (let jPos = 0; jPos < this.Length; jPos++) {
          const pmInfo = this.positions[jPos].freq;
          const m: string = s[this.startPosition + jPos] || '-';
          if (!(m in pmInfo))
            pmInfo[m] = new PositionMonomerInfo();

          pmInfo[m].count++;
        }
      }
    }

    //#region Polish freq counts
    for (let jPos = 0; jPos < this.Length; jPos++) {
      // delete this.positions[jPos].freq['-'];

      this.positions[jPos].rowCount = 0;
      for (const m in this.positions[jPos].freq)
        this.positions[jPos].rowCount += this.positions[jPos].freq[m].count;
    }
    //#endregion

    const maxHeight = this.canvas.height - this.axisHeight;
    // console.debug(`WebLogo._calculate() maxHeight=${maxHeight}.`);

    //#region Calculate screen
    for (let jPos = 0; jPos < this.Length; jPos++) {
      const freq: { [c: string]: PositionMonomerInfo } = this.positions[jPos].freq;
      const rowCount = this.positions[jPos].rowCount;

      let y: number = this.axisHeight;

      const entries = Object.entries(freq).sort((a, b) => {
        if (a[0] !== '-' && b[0] !== '-')
          return b[1].count - a[1].count;
        else if (a[0] === '-' && b[0] === '-')
          return 0;
        else if (a[0] === '-')
          return -1;
        else /* (b[0] === '-') */
          return +1;
      });
      for (const entry of entries) {
        const pmInfo: PositionMonomerInfo = entry[1];
        // const m: string = entry[0];
        const h: number = maxHeight * pmInfo.count / rowCount;

        pmInfo.bounds = new DG.Rect(jPos * this.positionWidth, y, this.positionWidth, h);
        y += h;
      }
    }
    //#endregion
  }

  // reflect changes made to filter/selection
  render(recalc = true) {
    if (this.msgHost) {
      if (this.seqCol && !this.cp) {
        this.msgHost!.innerText = `Unknown palette (column semType: '${this.seqCol.semType}').`;
        this.msgHost!.style.display = '';
      } else {
        this.msgHost!.style.display = 'none';
      }
    }

    if (!this.canvas || !this.seqCol || !this.dataFrame || !this.cp ||
      this.startPosition === -1 || this.endPosition === -1)
      return;

    const g = this.canvas.getContext('2d');
    if (!g) return;

    if (recalc)
      this._calculate();

    // let rowCount = this.rowsMasked;
    // if (!this.considerNullSequences)
    //   rowCount -= this.rowsNull;

    g.resetTransform();
    g.fillStyle = 'white';
    g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    g.textBaseline = this.textBaseline;

    //#region Plot positionNames
    g.resetTransform();
    g.fillStyle = 'black';
    g.textAlign = 'center';
    g.font = '10px Roboto, Roboto Local, sans-serif';
    const posNameMaxWidth = Math.max(...this.positions.map((pos) => g.measureText(pos.name).width));
    const hScale = posNameMaxWidth < (this.positionWidth - 2) ? 1 : (this.positionWidth - 2) / posNameMaxWidth;

    for (let jPos = 0; jPos < this.Length; jPos++) {
      const pos: PositionInfo = this.positions[jPos];
      g.resetTransform();
      g.setTransform(
        hScale, 0, 0, 1,
        jPos * this.positionWidth + this.positionWidth / 2, 0);
      g.fillText(pos.name, 0, 0);
    }
    //#endregion Plot positionNames

    for (let jPos = 0; jPos < this.Length; jPos++) {
      for (const [monomer, pmInfo] of Object.entries(this.positions[jPos].freq)) {
        if (monomer !== '-') {
          const b = pmInfo.bounds;

          const fontStyle = '16px Roboto, Roboto Local, sans-serif';
          // Hacks to scale uppercase characters to target rectangle
          const uppercaseLetterAscent = 0.25;
          const uppercaseLetterHeight = 12.2;

          g.resetTransform();
          g.strokeStyle = 'lightgray';
          g.lineWidth = 1;
          g.rect(b.left, b.top, b.width, b.height);
          g.fillStyle = this.cp[monomer] ?? this.cp['other'];
          g.textAlign = 'left';
          g.font = fontStyle;
          //g.fillRect(b.left, b.top, b.width, b.height);
          const mTm: TextMetrics = g.measureText(monomer);

          // if (mM.actualBoundingBoxAscent != 0)
          //   console.debug(`m: ${m}, mM.actualBoundingBoxAscent: ${mM.actualBoundingBoxAscent}`);

          g.setTransform(
            b.width / mTm.width, 0, 0, b.height / uppercaseLetterHeight,
            b.left, b.top);
          g.fillText(monomer, 0, -uppercaseLetterAscent);
        }
      }
    }
  }

  private calcSize() {
    if (!this.canvas || !this.host)
      return;

    const width: number = this.Length * this.positionWidth;
    this.canvas.width = width;
    this.canvas.style.width = `${width}px`;

    const height = Math.min(this.maxHeight, Math.max(this.minHeight, this.root.clientHeight));
    // const canvasHeight: number = width > this.root.clientWidth ? height - 8 : height;
    this.host.style.setProperty('height', `${height}px`);
    const canvasHeight: number = this.host.clientHeight;
    this.canvas.height = canvasHeight;
    this.canvas.style.setProperty('height', `${canvasHeight}px`);

    // Adjust host and root width
    if (this.fixWidth) {
      // full width for canvas host and root
      this.root.style.width = this.host.style.width = `${width}px`;
      this.root.style.height /*= this.host.style.height*/ = `${height}px`;
      this.host.style.setProperty('overflow', 'hidden', 'important');
    } else {
      // allow scroll canvas in root
      this.root.style.width = this.host.style.width = '100%';
      this.host.style.overflowX = 'auto!important';
      this.host.style.setProperty('overflow', null);

      this.host.style.setProperty('text-align', this.horizontalAlignment);

      // vertical alignment
      let hostTopMargin = 0;
      switch (this.verticalAlignment) {
      case 'top':
        hostTopMargin = 0;
        break;
      case 'middle':
        hostTopMargin = Math.max(0, (this.root.clientHeight - height) / 2);
        break;
      case 'bottom':
        hostTopMargin = Math.max(0, this.root.clientHeight - height);
        break;
      }
      this.host.style.setProperty('margin-top', `${hostTopMargin}px`, 'important');

      if (this.root.clientHeight < height) {
        this.host.style.setProperty('height', `${this.root.clientHeight}px`);
        this.host.style.setProperty('overflow-y', null);
      } else {
        this.host.style.setProperty('overflow-y', 'hidden', 'important');
      }
    }

    // console.debug(
    //   `this.root.style.height = ${this.root.style.height}\n` +
    //   `this.root.clientHeight = ${this.root.clientHeight}\n` +
    //   `this.host.style.height = ${this.host.style.height}\n` +
    //   `this.host.clientHeight = ${this.host.clientHeight}\n` +
    //   '\n' +
    //   `this.canvas.height       = ${this.canvas.height}\n` +
    //   `this.canvas.style.height = ${this.canvas.style.height}`);
  }

  /**
   * @param {DG.Column} seqCol Column to look for a palette
   * @param {number}  minLength minimum length of sequence to detect palette (empty strings are allowed)
   * @return {SeqPalette} Palette corresponding to the alphabet of the sequences in the column
   */
  private pickUpPalette(seqCol: DG.Column, minLength: number = 0): SeqPalette | null {
    let res: SeqPalette | null = null;
    switch (seqCol.semType) {
    case Aminoacids.SemTypeMultipleAlignment:
      res = AminoacidsPalettes.GrokGroups;
      break;
    case Nucleotides.SemTypeMultipleAlignment:
      res = NucleotidesPalettes.Chromatogram;
      break;
    }
    if (res === null) {
      // The alphabet of nucleotides is a smaller set, so we check it first.
      const alphabet = {...Nucleotides.Names, ...{'-': 'gap'}};
      res = DG.Detector.sampleCategories(seqCol, (s) => {
        return !s || (s.length > minLength && s.split('').every((n) => n in alphabet));
      }) ? NucleotidesPalettes.Chromatogram : null;
    }
    if (res === null) {
      // And then check for amino acids alphabet.
      const alphabet = {...Aminoacids.Names, ...{'-': 'gap'}};
      res = DG.Detector.sampleCategories(seqCol, (s) => {
        return !s || (s.length > minLength && s.split('').every((n) => n in alphabet));
      }) ? AminoacidsPalettes.GrokGroups : null;
    }
    return res;
  }

  /** First try to find column with semType 'alignedSequence'.
   * Next look for column with data alphabet corresponding to any of the known palettes.
   * @param {DG.DataFrame} dataFrame
   * @return {DG.Column} The column we were looking for or null
   */
  private pickUpSeqCol(dataFrame: DG.DataFrame): DG.Column | null {
    let res: DG.Column | null = dataFrame.columns.toList()
      .find((c: DG.Column) => c.semType == 'alignedSequence') || null;

    if (res == null) {
      for (const col of dataFrame.columns) {
        const cp = this.pickUpPalette(col as DG.Column, 5);
        if (cp !== null) {
          res = col;
          break;
        }
      }
    }
    return res;
  }
}
