/**
 * The class contains semantic type detectors.
 * Detectors are functions tagged with `DG.FUNC_TYPES.SEM_TYPE_DETECTOR`.
 * See also: https://datagrok.ai/help/develop/how-to/define-semantic-type-detectors
 * The class name is comprised of <PackageName> and the `PackageDetectors` suffix.
 * Follow this naming convention to ensure that your detectors are properly loaded.
 */
class AnnaSequencePackageDetectors extends DG.Package {
    //tags: semTypeDetector
    //input: column col
    //output: string semType
    detectNucleotides(col) {
        if (col.type === DG.TYPE.STRING && col.categories.every(cat => /^[\satgcATGC]+$/.test(cat))) {
            col.semType = 'dna_nucleotide';
            return col.semType;
        }
        return null;
        }

    //tags: semTypeDetector
    //input: column col
    //output: string semType
    isPotentialENAIdCol(col) {
        if (col.type === DG.TYPE.STRING && col.categories.every(cat => /[A-Z]{2}[0-9]{6}/.test(cat))) { // add ^$ to regex if needed
            col.semType = 'ENA';
            return col.semType;
        }
        return null;
    }

    //input: string str
    //output: bool result
    isPotentialENAId(str) {
        return /[A-Z]{2}[0-9]{6}/.test(str);
    }
}



