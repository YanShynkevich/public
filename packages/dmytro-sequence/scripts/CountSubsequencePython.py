#name: CountSubsequencePython
#description: Counts sequence occurences
#language: python
#input: string sequence
#input: string subsequence
#output: int count

count = start = 0
while True:
    start = sequence.find(subsequence, start) + 1
    if start > 0:
        count += 1
    else:
        break
