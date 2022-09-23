import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import { similarityMetric } from '@datagrok-libraries/utils/src/similarity-metrics';
import $ from 'cash-dom';
import { SequenceSearchBaseViewer } from './sequence-search-base-viewer';
import { getMonomericMols } from '../calculations/monomerLevelMols';
import * as C from '../utils/constants';
import { createDifferenceCanvas, createDifferencesWithPositions } from './sequence-activity-cliffs';
import { updateDivInnerHTML } from '../utils/ui-utils';
import { WebLogo } from '@datagrok-libraries/bio/src/viewers/web-logo';

export class SequenceSimilarityViewer extends SequenceSearchBaseViewer {
  hotSearch: boolean;
  sketchedMolecule: string = '';
  curIdx: number = 0;
  molCol: DG.Column | null = null;
  idxs: DG.Column | null = null;
  scores: DG.Column | null = null;
  cutoff: number;
  gridSelect: boolean = false;
  targetMoleculeIdx: number = 0;

  constructor() {
    super('similarity');
    this.cutoff = this.float('cutoff', 0.01, { min: 0, max: 1 });
    this.hotSearch = this.bool('hotSearch', true);
    this.updateMetricsLink(this.metricsDiv, this, { fontSize: '10px', fontWeight: 'normal', height: '10px' });
  }

  init(): void {
    this.hotSearch = true;
    this.initialized = true;
  }

  async render(computeData = true): Promise<void> {
    if (!this.beforeRender())
      return;
    if (this.moleculeColumn) {
      this.curIdx = this.dataFrame!.currentRowIdx == -1 ? 0 : this.dataFrame!.currentRowIdx;
      if (computeData) {
        this.targetMoleculeIdx = this.dataFrame!.currentRowIdx == -1 ? 0 : this.dataFrame!.currentRowIdx;
        const monomericMols = await getMonomericMols(this.moleculeColumn);
        //need to create df to calculate fingerprints
        const monomericMolsDf = DG.DataFrame.fromColumns([monomericMols]);
        const df = await grok.functions.call('Chem:callChemSimilaritySearch', {
          df: this.dataFrame,
          col: monomericMols,
          molecule: monomericMols.get(this.targetMoleculeIdx),
          metricName: this.distanceMetric,
          limit: this.limit,
          minScore: this.cutoff,
          fingerprint: this.fingerprint
        });
        this.idxs = df.getCol('indexes');
        this.scores = df.getCol('score');
        const seqCol = DG.Column.string('sequence', this.idxs!.length).init((i) => this.moleculeColumn?.get(this.idxs?.get(i)));
        seqCol.semType = DG.SEMTYPE.MACROMOLECULE;
        this.tags.forEach(tag => seqCol.setTag(tag, this.moleculeColumn!.getTag(tag)));
        let resDf = DG.DataFrame.fromColumns([this.idxs!, seqCol, this.scores!]);
        resDf = resDf.groupBy(resDf.columns.names()).where(`indexes != ${this.targetMoleculeIdx}`).aggregate();
        resDf.columns.remove('indexes');
        resDf.onCurrentRowChanged.subscribe((_) => {
          this.createPropertyPanel(resDf);
        });
        this.updateSimilarityGrid(resDf);
      }
    }
  }

  updateSimilarityGrid(resDf: DG.DataFrame){
    const targetMolCol = DG.Column.string('sequence', 1).init((i) => this.moleculeColumn?.get(this.idxs?.get(i)));
    targetMolCol.semType = DG.SEMTYPE.MACROMOLECULE;
    this.tags.forEach(tag => targetMolCol.setTag(tag, this.moleculeColumn!.getTag(tag)));
    const targetGrid = DG.DataFrame.fromColumns([targetMolCol]).plot.grid().root;
    targetGrid.style.height = '30px';
    const div = ui.divV([
      ui.divText('Target:', {style: {fontWeight: 'bold'}}),
      targetGrid,
      ui.divText('Similar:', {style: {fontWeight: 'bold'}}),
      resDf.plot.grid().root
    ]);
    updateDivInnerHTML(this.root, div);
  }

  createPropertyPanel(resDf: DG.DataFrame) {
    const propPanel = ui.div();
    const molDifferences: { [key: number]: HTMLCanvasElement } = {};
    const units = resDf.col('sequence')!.getTag(DG.TAGS.UNITS);
    const separator = resDf.col('sequence')!.getTag(C.TAGS.SEPARATOR);
    const splitter = WebLogo.getSplitter(units, separator);
    const subParts1 = splitter(this.moleculeColumn!.get(this.targetMoleculeIdx));
    const subParts2 = splitter(resDf.get('sequence', resDf.currentRowIdx));
    const canvas = createDifferenceCanvas(subParts1, subParts2, units, molDifferences);
    propPanel.append(ui.div(canvas, { style: { width: '300px', overflow: 'scroll' } }));
    if (subParts1.length !== subParts2.length) {
      propPanel.append(ui.divV([
        ui.divText(`Different sequence length:`, { style: { fontWeight: 'bold' } }),
        ui.divText(`target: ${subParts1.length} monomers`),
        ui.divText(`selected: ${subParts2.length} monomers`)
      ], { style: { paddingBottom: '10px' } }));
    }
    propPanel.append(createDifferencesWithPositions(molDifferences));
    const acc = ui.accordion();
    const accIcon = ui.element('i');
    accIcon.className = 'grok-icon svg-icon svg-view-layout';
    acc.addTitle(ui.span([accIcon, ui.label(`Similarity search`)]));
    acc.addPane('Differeces', () => propPanel, true);
    grok.shell.o = acc.root;
  }
}