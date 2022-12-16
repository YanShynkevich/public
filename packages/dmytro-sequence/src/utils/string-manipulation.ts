import * as DG from 'datagrok-api/dg';

export function getSubsequenceCountInColumn(subsequenceColumn: DG.Column, sequenceColumn: DG.Column,
  subsequenceLength: number): number[] {
  const subsequenceColumnCategoryIndexesArray = subsequenceColumn?.getRawData();
  const sequenceColumnCategoryIndexesArray = sequenceColumn?.getRawData();
  const countList: number[] = [];

  for (let i = 0; i < subsequenceColumn!.length; i++) {
    let count = 0;
    const subsequenceList = extractSubsequencesFromString(subsequenceColumn?.
      categories[subsequenceColumnCategoryIndexesArray![i]]!, subsequenceLength);

    for (let j = 0; j < sequenceColumn!.length; j++) {
      subsequenceList.forEach((element) => {
        count += substringOccurencesInString(sequenceColumn?.
          categories[sequenceColumnCategoryIndexesArray![j]]!, element);
      });
    }

    countList.push(count);
  }

  return countList;
}

export function extractSubsequencesFromString(sequence: string, length: number): Array<string> {
  const elements = sequence.split(' ');
  const subsequenceSet = new Set<string>;

  elements.forEach((element) => {
    const regex = new RegExp('(.{'+length.toString()+'})');
    for (let i = 0; i < element.length; i++) {
      const pieces = element.split(regex).filter((elem) => elem.length === length);
      for (const p of pieces)
        subsequenceSet.add(p);
      element = element.substring(1);
    }
  });

  return Array.from(subsequenceSet);
}

export function substringOccurencesInString(string: string, substring: string): number {
  let count = 0;
  let index = 0;

  while (true) {
    index = string.indexOf(substring, index);
    if (index >= 0) {
      count++;
      index++;
    } else break;
  }

  return count;
}
