/**
 * The class contains semantic type detectors.
 * Detectors are functions tagged with `DG.FUNC_TYPES.SEM_TYPE_DETECTOR`.
 * See also: https://datagrok.ai/help/develop/how-to/define-semantic-type-detectors
 * The class name is comprised of <PackageName> and the `PackageDetectors` suffix.
 * Follow this naming convention to ensure that your detectors are properly loaded.
 */

class DmytroSequencePackageDetectors extends DG.Package {
  //tags: semTypeDetector
  //input: column col
  //output: string semType
  detectNucleotides(col) {
    const regex = '^[ATGC]+$';
    if (col.type === DG.TYPE.STRING && col.categories.every((category) => category.match(regex))) {
      col.semType = 'dna_nucleotide';
      return col.semType;
    }
    return null;
  }
}
