/**
 * The class contains semantic type detectors.
 * Detectors are functions tagged with `DG.FUNC_TYPES.SEM_TYPE_DETECTOR`.
 * See also: https://datagrok.ai/help/develop/how-to/define-semantic-type-detectors
 * The class name is comprised of <PackageName> and the `PackageDetectors` suffix.
 * Follow this naming convention to ensure that your detectors are properly loaded.
 */

class DmytroSequencePackageDetectors extends DG.Package {
  //nucleotide detector

  //tags: semTypeDetector
  //input: column col
  //output: string semType
  detectNucleotides(col) {
    const regex = new RegExp('^[ACGTRNDacgtrnd\\s]+$');
    if (col.type === DG.TYPE.STRING && col.categories.every((category) => category.match(regex))) {
      col.semType = 'dna_nucleotide';
      return col.semType;
    }
    return null;
  }

  //enaId detector

  //tags: semTypeDetector
  //input: column col
  //output: string semType
  detectEnaID(col) {
    const regex = '^[A-Z]{2}[0-9]{6}$';
    if (col.type === DG.TYPE.STRING && col.categories.every((category) => category.match(regex))) {
      col.semType = 'EnaID';
      return col.semType;
    }
    return null;
  }

  //check if string is a potential ena id

  // //input: string str
  // //output: bool result
  // isPotentialENAId(str) {
  //   // returns true, if name is of the form [A-Z]{2}[0-9]{6}
  //   const regex = '^[A-Z]{2}[0-9]{6}$';
  //   console.log(str.match(regex));
  //   if (str.match(regex)) return true;
  //   return false;
  // }
}
