#name: CountSubsequencePythonDataframe
#description: Counts sequence occurences in dataframe
#language: python
#input: dataframe sequences
#input: column columnName
#input: string subsequence = "acc"
#output: dataframe result {action:join(sequences)}

def occurences(string, substring):
    count = start = 0
    while True:
        start = string.find(substring, start) + 1
        if start > 0:
            count += 1
        else:
            break
    return count

processed_df = pd.DataFrame(data=sequences)
result = pd.DataFrame()

column = [occurences(elem, subsequence) for elem in processed_df[columnName]]
result['N({})'.format(subsequence)] = column
