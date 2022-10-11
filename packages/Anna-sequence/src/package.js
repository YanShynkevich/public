/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import SmartLabel from 'fusioncharts-smartlabel';

export const _package = new DG.Package();

//name: info
export function info() {
	grok.shell.info(_package.webRoot);
}


//name: complement
//input: string nucleotides {semType: dna_nucleotide}
//output: string result {semType: dna_nucleotide}
export function complement(nucleotides) {
		let compl = '';

		for (let i of nucleotides) {
						if (i === 'A') compl += 'T';
						else if (i === 'T') compl += 'A';
						else if (i === 'G') compl += 'C';
						else if (i === 'C') compl += 'G';
		}
		return compl;
}


//name: getOrders
//language: javascript
//output: dataframe df
(async () => {
	const df = await grok.data.query(`AnnaSequence:ordersByCountry`, { country: 'USA'});
})();


//name: complementWidget
//tags: panel, widgets
//input: string nucleotides {semType: dna_nucleotide}
//output: widget result
//condition: true
export function complementWidget(nucleotides) {
		return new DG.Widget(ui.divText(complement(nucleotides)));
}


//name: fuzzyJoin
//input: dataframe df1
//input: dataframe df2
//input: int N
export function fuzzyJoin(df1, df2, N) {

		function get_seq_set(str, N=3) {
				return new Set(str.match(new RegExp('[atcgATCG]{' + N + '}', 'g')));
		}

		const col1 = df1.columns.bySemType('dna_nucleotide');
		const col2 = df2.columns.bySemType('dna_nucleotide');
		const col1_len = col1.length, col2_len = col2.length;
		const col1_arr = [], col2_arr = [];

		for (let i = 0; i < col1_len; i++) col1_arr.push(col1.getString(i));
		for (let i = 0; i < col2_len; i++) col2_arr.push(col2.getString(i));

		const col1_str = col1_arr.join(' ');
		const col2_str = col2_arr.join(' ');
		let df = df1.append(df2);
		df.columns.addNew('Counts', 'int');
		let row, subs, cnt;

		for (let i = 0; i < col1_len; i++) {
				cnt = 0;
				row = col1_arr[i];
				subs = get_seq_set(row);
				for (let j of subs)
						cnt += (col2_str.match(new RegExp(j, 'g')) || []).length;
				df.getCol('Counts').set(i, cnt);
		}

		for (let i = 0; i < col2_len; i++) {
				cnt = 0;
				row = col2_arr[i];
				subs = get_seq_set(row);
				for (let j of subs)
						cnt += (col1_str.match(new RegExp(j, 'g')) || []).length;
				df.getCol('Counts').set(col1_len + i, cnt);
		}

		grok.shell.addTableView(df);
}


class NucleotideBoxCellRenderer extends DG.GridCellRenderer {
		get name() { return 'Nucleotide cell renderer'; }

		get cellType() { return 'dna_nucleotide'; }

		render(g, x, y, w, h, gridCell, cellStyle) {
				const seq = gridCell.cell.value;
				const sl = new SmartLabel('id', true);
				sl.fontsize = 10;
				const a = sl.getSmartText(seq, w, h);
				const labelObj = SmartLabel.textToLines(a).lines;
				let ctx = g.canvas.getContext("2d");
				ctx.fillStyle = 'black';
				ctx.font = '10px monospace';
				let space = labelObj.length;
				space = Math.round(h / (labelObj.length + 1));

				for (let i = 0; i < labelObj.length; i++)
						ctx.fillText(labelObj[i], x + 3, y + 3 + space + i*space);
		}
}


//name: nucleotideBoxCellRenderer
//tags: cellRenderer
//meta.cellType: dna_nucleotide
//output: grid_cell_renderer result
export function nucleotideBoxCellRenderer() {
		return new NucleotideBoxCellRenderer();
}


//name: ENA Sequence
//tags: panel, widgets
//input: string cellText {semType: ENA}
//output: widget result
//condition: isPotentialENAId(cellText)
export async function enaSequence(cellText) {
		const url = `https://www.ebi.ac.uk/ena/browser/api/fasta/${cellText}`;
		const fasta = await (await grok.dapi.fetchProxy(url)).text();

		if (fasta.length === 0) return null;
		const ind = fasta.indexOf('\n');
		const caption = fasta.slice(0, ind);
		const sequence = fasta.slice(ind + 1);
		const header = ui.divText(caption);
		const seq_box = ui.textInput('', sequence);
		seq_box.input.setAttribute('rows', '10');
		const content = ui.inputs([seq_box]);
		const info_panel = ui.splitV([header, content], null, true);

		return new DG.Widget(ui.box(info_panel));
}


//name: fetchENASequence 
//input: string query 
//input: int limit
//input: int length
//output: dataframe df
export async function _fetchENASequence(query, limit, length) {
	const url = `https://www.ebi.ac.uk/ena/browser/api/embl/textsearch?result=sequence&query=${query}&limit=${limit}`;
	const text = await (await grok.dapi.fetchProxy(url)).text();
	const sequences = [], ids = [];
	const arr = text.split('//');
	arr.pop();
	
	for (let i of arr) {
		const seq = i.match(/(?<=XX\nSQ.*other;)([^]*)/g);
		if (seq) {
			let a = seq[0].replace(/[0-9]/g, "");
			if (a.length > length) a = a.slice(0, length);
			sequences.push(a);
			ids.push(i.match(/[A-Z]{2}[0-9]{6}/g)[0])
		}
	}

	const df = DG.DataFrame.fromColumns([
		DG.Column.fromList(DG.COLUMN_TYPE.STRING, 'ID', ids),
		DG.Column.fromList(DG.COLUMN_TYPE.STRING, 'Sequence', sequences)
	]);

	return df;
}


//name: formENADataTable
export async function formENADataTable() {
	let df = DG.DataFrame.create(10);
	let grid = DG.Viewer.grid(df);
	let limitInput = ui.intInput('How many rows: ', 100);
	let queryInput = ui.stringInput('Query: ', 'coronavirus');
	let lengthInput = ui.intInput('Sequece length: ', 60);
	let button = ui.button('Preview', async () => {
		df = await _fetchENASequence(queryInput.value, '10', lengthInput.value);
		grid.dataFrame = df;
	});

	let css_all = {style: {'width': '100%', 'height': '100%'}};
	ui.dialog('Create sequences table')
	.add(ui.splitV([
		ui.splitH([
		ui.span([queryInput.root, limitInput.root, lengthInput.root]),
		button
		]),
		ui.div([grid]),
	], css_all))
	.onOK(async () => {
		df = await _fetchENASequence(queryInput.value, limitInput.value, lengthInput.value);
		grok.shell.addTableView(df);
	})
	.show({width: 500, height: 500});
}