//name: CountSubsequenceJS
//description: Counts sequence occurences
//language: javascript
//input: string sequence
//input: string subsequence
//output: int count

count = 0;

let index = 0;
while (true) {
  index = sequence.indexOf(subsequence, index);
  if (index >= 0) {
    count++;
    index++;
  } else break;
}
