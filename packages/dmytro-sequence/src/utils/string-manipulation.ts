import * as DG from 'datagrok-api/dg';

export function getSubsequenceCountInColumn(subsequenceColumn: DG.Column, sequenceColumn: DG.Column,
  subsequenceLength: number): Int32Array {
  const subsequenceColumnCategoryIndexesArray = subsequenceColumn?.getRawData();
  const sequenceColumnCategoryIndexesArray = sequenceColumn?.getRawData();
  const countList = new Int32Array(subsequenceColumn.length);

  for (let i = 0; i < subsequenceColumn!.length; i++) {
    let count = 0;
    const subsequenceList = extractSubsequencesFromString(subsequenceColumn?.
      categories[subsequenceColumnCategoryIndexesArray![i]]!, subsequenceLength);

    for (let j = 0; j < sequenceColumn!.length; j++) {
      for (let k = 0; k < subsequenceList.length; k++) {
        count += substringOccurencesInStringWithOverlapping(sequenceColumn?.
          categories[sequenceColumnCategoryIndexesArray![j]]!, subsequenceList[k]);
      }
    }

    countList[i] = count;
  }

  return countList;
}

export function extractSubsequencesFromString(sequence: string, length: number): Array<string> {
  const elements = sequence.split(' ');
  const subsequenceSet = new Set<string>;

  for (let i = 0; i < elements.length; i++) {
    //regex for getting all the possible subsequences of length N
    const regex = new RegExp('(.{'+length.toString()+'})');
    for (let j = 0; j < elements[i].length; j++) {
      const pieces = elements[i].split(regex).filter((elem) => elem.length === length);
      for (const p of pieces)
        subsequenceSet.add(p);
      //get to the next char
      elements[i] = elements[i].substring(1);
    }
  }

  return Array.from(subsequenceSet);
}

export function substringOccurencesInStringWithOverlapping(string: string, substring: string): number {
  let count = 0;

  for (let index = 0; ; index++) {
    index = string.indexOf(substring, index);
    if (index === -1) break;
    count++;
  }

  return count;
}
