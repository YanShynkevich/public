export const enum Tests {
  nwk0 = 'nwk0',
  nwk0NamedRoot = 'nwk0NamedRoot',
  nwk1NoNameNoHeight = 'nwk1NoNameNoHeight',
  nwk1NameNoHeight = 'nwk1NameNoHeight',
  nwk1NameHeight = 'nwk1NameHeight',
  nwk1NoNameHeight = 'nwk1NoNameHeight',
  nwk3LeafsNoHeight = 'nwk3LeafsNoHeight',
  nwk3LeafsIntNodesNoHeight = 'nwk3LeafsIntNodesNoHeight',
}

export const testsData: { [test: string]: { nwk: string, obj: Object } } = {
  [Tests.nwk0]: {
    nwk: ';',
    obj: {},
  },
  [Tests.nwk0NamedRoot]: {
    nwk: '()namedRoot;',
    obj: {
      name: 'namedRoot', // root
      children: [{name: '',}]
    },
  },
  [Tests.nwk1NoNameNoHeight]: {
    nwk: '();',
    obj: {
      //name: '', // root
      children: [{name: '',}]
    },
  },
  [Tests.nwk1NameNoHeight]: {
    nwk: '(single);',
    obj: {
      // name: '', // root
      children: [{name: 'single',}]
    },
  },
  [Tests.nwk1NameHeight]: {
    nwk: '(single:1.2);',
    obj: {
      // name: '', // root
      children: [{name: 'single', branch_length: 1.2}]
    },
  },
  [Tests.nwk1NoNameHeight]: {
    nwk: '(:1.2);',
    obj: {
      // name: '', // root
      children: [{name: '', branch_length: 1.2},]
    },
  },
  [Tests.nwk3LeafsNoHeight]: {
    nwk: '((n1,n2),n3);',
    obj: {
      // name: '', // root
      children: [
        {
          name: '',
          children: [{name: 'n1'}, {name: 'n2'},],
        },
        {name: 'n3',},
      ]
    },
  },
  [Tests.nwk3LeafsIntNodesNoHeight]: {
    nwk: '((n1,n2)in1,n3);',
    obj: {
      // name: '', // root
      children: [
        {
          name: 'in1',
          children: [{name: 'n1'}, {name: 'n2'},],
        },
        {name: 'n3',},
      ]
    },
  },
};
