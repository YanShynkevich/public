// import {NodeType} from '@phylocanvas/phylocanvas.gl';

import {Observable} from 'rxjs';

interface NodeType {
  name: string;
  children: NodeType[];
  branch_length: number;
  isLeaf: boolean;
}

export {NodeType as NodeType};

export type Monomer = {
  at: { [R: string]: string },
  id: string,
  m: string,
  n: string,
  na: string,
  rs: number;
}

//expected types: HELM_AA, HELM_BASE, HELM_CHEM, HELM_LINKER, HELM_SUGAR
export interface IMonomerLib {
  get(monomerType: string, monomerName: string): Monomer | null;

  // TODO:
  get onChanged(): Observable<any>;
}