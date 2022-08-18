import {category, expect, expectFloat, test} from '@datagrok-libraries/utils/src/test';
import {Func} from "datagrok-api/src/entities";
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';
import {chem} from 'datagrok-api/grok';
import Sketcher = chem.Sketcher;
import { _package } from '../package-test';
const exampleSmiles = 'CC(C(=O)OCCCc1cccnc1)c2cccc(c2)C(=O)c3ccccc3';
const convertedSmarts = '[#6]-[#6](-[#6](=O)-[#8]-[#6]-[#6]-[#6]-c1cccnc1)-c1cccc(c1)-[#6](=O)-c1ccccc1';

category('sketcher testing', () => {
    test('smiles-to-mol', async () => {
        const funcs = Func.find({tags: ['moleculeSketcher']});
        for (let f of funcs) {
            const smilesString = exampleSmiles;
            // @ts-ignore
            const sketcher = await f!.apply();
            sketcher.smiles = smilesString;
            const resultMol = sketcher.molFile;
            const convertedSmiles = grok.chem.convert(resultMol, 'mol', 'smiles');
            expect(convertedSmiles, smilesString);
        }

    });

    test('mol-to-smiles', async () => {
        const funcs = Func.find({tags: ['moleculeSketcher']});
        for (let f of funcs) {
            const smilesString = exampleSmiles;
            // @ts-ignore
            const sketcher = await f!.apply();
            const startMol = grok.chem.convert(smilesString, 'smiles', 'mol');
            sketcher.mol = startMol;
            const resultSmiles = sketcher.smiles;
            expect(resultSmiles, smilesString);
        }
    });
    test('mol-to-smarts', async () => {
        const funcs = Func.find({tags: ['moleculeSketcher']});
        for (let f of funcs) {
            const smilesString = exampleSmiles;
            // @ts-ignore
            const sketcher = await f!.apply();
            const startMol = grok.chem.convert(smilesString, 'smiles', 'mol');
            sketcher.mol = startMol;
            const resultSmarts = await sketcher.getSmarts();
            expect(resultSmarts, convertedSmarts);
        }
    });
    test('smiles-to-smarts', async () => {
        const funcs = Func.find({tags: ['moleculeSketcher']});
        for (let f of funcs) {
            const smilesString = exampleSmiles;
            // @ts-ignore
            const sketcher = await f!.apply();
            sketcher.smiles = smilesString;
            const resultSmarts = await sketcher.getSmarts();
            expect(resultSmarts, convertedSmarts);
        }

    });
    
     test('molfileV2000', async () => {
        const data = DG.DataFrame.fromCsv(await _package.files.readAsText('test.csv'));
        const sketcher = new Sketcher();
        for (let i = 0; i < data.rowCount; i++) {
            sketcher.setMolFile(data.get('molecule', i));
            return sketcher.getMolFile();
        }
    });
    
    test('smarts', async () => {
        const data = DG.DataFrame.fromCsv(await _package.files.readAsText('test-consistency-smarts-mol.csv'));
        const funcs = Func.find({tags: ['moleculeSketcher']});
        for (let f of funcs) {
            for (let i = 0; i < data.rowCount; i++) {
                // @ts-ignore
               const sketcher = await f!.apply();
               const smarts = data.get('SMARTS', i);
               sketcher.setSmarts(smarts);
               expect(await sketcher.getSmarts(), smarts);
            }
        }
    });
    
    test('molfileV3000', async () => {
        const data = DG.DataFrame.fromCsv(await _package.files.readAsText('v3000_sample.csv'));
        const funcs = Func.find({tags: ['moleculeSketcher']});
        for (let f of funcs) {
            for (let i = 0; i < data.rowCount; i++) {
                // @ts-ignore
               const sketcher = await f!.apply();
               const molV3000 = data.get('molecule', i);
               sketcher.setMolFile(molV3000);
               return sketcher.getMolFile();
            }
        }
    });

});