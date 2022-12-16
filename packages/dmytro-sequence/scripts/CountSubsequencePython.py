#name: CountSubsequencePython
#description: Counts sequence occurences
#language: python
#input: string sequence
#input: string subsequence
#output: int count

count = start = 0
while start != -1:
    start = sequence.find(subsequence, start)
    if start > -1:
        count += 1
        start += 1
