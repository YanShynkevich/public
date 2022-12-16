//name: CountSubsequenceJS
//description: Counts sequence occurences
//language: javascript
//input: string sequence
//input: string subsequence
//output: int count

count = 0;

for (let index = 0; ; index++) {
  index = sequence.indexOf(subsequence, index);
  if (index === -1) break;
  count++;
}
