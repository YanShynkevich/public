import * as DG from 'datagrok-api/dg';

//function for getting subsequences count in another column sequences
export function getSubsequenceCountInColumn(subsequenceColumn: DG.Column, sequenceColumn: DG.Column,
  subsequenceLength: number): Int32Array {
  //get categories indexes using getRawData()
  const subsequenceColumnCategoryIndexesArray = subsequenceColumn?.getRawData();
  const sequenceColumnCategoryIndexesArray = sequenceColumn?.getRawData();
  const countList = new Int32Array(subsequenceColumn.length);

  for (let i = 0; i < subsequenceColumn!.length; i++) {
    let count = 0;
    //get all subsequences list
    const subsequenceList = extractSubsequencesFromString(subsequenceColumn?.
      categories[subsequenceColumnCategoryIndexesArray![i]]!, subsequenceLength);

    for (let j = 0; j < sequenceColumn!.length; j++) {
      for (let k = 0; k < subsequenceList.length; k++) {
        //get count of occurences
        count += substringOccurencesInStringWithOverlapping(sequenceColumn?.
          categories[sequenceColumnCategoryIndexesArray![j]]!, subsequenceList[k]);
      }
    }

    countList[i] = count;
  }

  return countList;
}

//function for getting all subsequences from string
export function extractSubsequencesFromString(sequence: string, length: number): Array<string> {
  const elements = sequence.split(' ');
  //create set of subsequences for unique only elements
  const subsequenceSet = new Set<string>;

  for (let i = 0; i < elements.length; i++) {
    //regex for getting all the possible subsequences of length N
    const regex = new RegExp('(.{'+length.toString()+'})');
    for (let j = 0; j < elements[i].length; j++) {
      //getting the subsequences
      const pieces = elements[i].split(regex).filter((elem) => elem.length === length);
      for (const p of pieces)
        subsequenceSet.add(p);
      //get to the next char
      elements[i] = elements[i].substring(1);
    }
  }

  //convert set to array
  return Array.from(subsequenceSet);
}

//function for getting the countn of substring occurenses in string
export function substringOccurencesInStringWithOverlapping(string: string, substring: string): number {
  let count = 0;

  for (let index = 0; ; index++) {
    index = string.indexOf(substring, index);
    if (index === -1) break;
    count++;
  }

  return count;
}
