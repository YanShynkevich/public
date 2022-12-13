//name: CountSubsequenceJS
//description: Counts sequence occurences
//language: javascript
//input: string sequence
//input: string subsequence
//output: int count

const regex = new RegExp(subsequence, 'g');
count = (sequence.match(regex) || []).length;
