import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import * as d3 from 'd3';

import {default as newickParserInt} from 'phylotree/src/formats/newick';
import {PhylotreeNode} from 'phylotree';

export function trans(color: number, alpha: number): number {
  return 0 |
    Math.round(DG.Color.a(color) * alpha) << 24 |
    DG.Color.r(color) << 16 |
    DG.Color.g(color) << 8 |
    DG.Color.b(color);
}

export function toRgba(color: number): string {
  return `rgba(${DG.Color.r(color)}, ${DG.Color.g(color)}, ${DG.Color.b(color)}, ${DG.Color.a(color) / 255})`;
}

/** Newick parser from phylotree patched for root name */
export function phylotreeNewickParser(newick: string) {
  const res = newickParserInt(newick);

  let rootName: string | null = null;

  const rootDataStart: number = newick.lastIndexOf(')');
  const rootDataEnd: number = newick.lastIndexOf(';');
  if (rootDataStart != -1 && rootDataEnd != -1) {
    const rootData: string = newick.substring(rootDataStart + 1, rootDataEnd);
    const rootDataParts: string[] = rootData.split(':');
    rootName = rootDataParts[0];
  }

  if (rootName)
    res.json.name = rootName;
  else
    //@ts-ignore
    delete res.json.name;

  return res;
}

export function newickToDf(
  newick: string, dfName?: string, nodePrefix?: string, skipEmptyParentRoot?: boolean
): DG.DataFrame {
  const nodePrefixV: string = nodePrefix ?? '';
  const skipEmptyParentRootV: boolean = skipEmptyParentRoot ?? false;

  let parent: string | null = null;
  let i = 0;

  const parsedNewick = phylotreeNewickParser(newick);
  if (parsedNewick.error)
    throw parsedNewick.error;

  const obj = parsedNewick.json;

  const nodes: string[] = [];
  const parents: string[] = [];
  const leafs: boolean[] = [];
  const distances: (number | null)[] = [];
  const annotations: any[] = [];

  function traverse(obj: PhylotreeNode) {
    if (obj === null || typeof obj != 'object') return;

    const isRoot: boolean = obj.name == 'root';

    let name: string = obj.name;
    if (!name) {
      name = obj.name = `${nodePrefixV}node-${i}`;
      ++i;
    } else if (isRoot) {
      name = `${nodePrefixV}root`;
    }

    if (!isRoot || !skipEmptyParentRootV) {
      nodes.push(name);
      distances.push(obj.attribute ? parseFloat(obj.attribute) : null);
      annotations.push(obj.annotation);
      parents.push(parent!);
      leafs.push(!obj.children || obj.children.length == 0);
    }

    if (!obj.children) return;
    const childrenNum = obj.children.length;
    const prevParent = parent;
    parent = name;

    for (let i = 0; i < childrenNum; i++) {
      traverse(obj.children[i]);
      if (i === childrenNum - 1) parent = prevParent;
    }
  }

  traverse(obj);

  const nodeCol: DG.Column = DG.Column.fromList(DG.COLUMN_TYPE.STRING, 'node', nodes);
  const parentCol: DG.Column = DG.Column.fromList(DG.COLUMN_TYPE.STRING, 'parent', parents);
  const leafCol: DG.Column = DG.Column.fromList(DG.COLUMN_TYPE.BOOL, 'leaf', leafs);
  // Preventing semType detectors to interpret data
  nodeCol.semType = 'id';
  parentCol.semType = 'id';
  const columns = [nodeCol, parentCol, leafCol];

  if (distances.some((d) => d !== null))
    columns.push(DG.Column.fromList('double', 'distance', distances));

  if (annotations.some((a) => !!a))
    columns.push(DG.Column.fromList('string', 'annotation', annotations));

  const df = DG.DataFrame.fromColumns(columns);

  if (dfName)
    df.name = `df-${dfName}`;

  df.setTag('.newick', newick);
  df.setTag('.newickJson', JSON.stringify(parsedNewick));

  return df;
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export function waitForElm(id: string, checkFrequency = 100, timeout = 1000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    (function loopSearch() {
      const element = document.getElementById(id);

      if (element) {
        return resolve(element);
      } else {
        setTimeout(() => {
          if ((Date.now() - startTime) > timeout)
            reject(new Error('Timeout'));

          loopSearch();
        }, checkFrequency);
      }
    })();
  });
}

/** Handles error and console.debug ET (elapsed time) */
export function catchToLog<T>(prefix: string, func: () => T): T {
  const t1: number = Date.now();
  try {
    const res: T = func();

    if (res instanceof Promise) {
      return res.catch((ex) => {
        console.error(prefix + ', ' + ex.toString());
        throw (ex);
      }).then((obj) => {
        const t2: number = Date.now();
        console.debug(prefix + `, ET: ${((t2 - t1) / 1000)} s`);

        return obj;
      }) as unknown as T;
    } else {
      const t2: number = Date.now();
      console.debug(prefix + `, ET: ${((t2 - t1) / 1000)} s`);

      return res;
    }
  } catch (ex: any) {
    console.error(prefix + ', ' + ex.toString());
    throw (ex);
  }
}

