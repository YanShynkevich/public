#name: CountSubsequencePythonDataframe
#description: Counts sequence occurences in dataframe
#language: python
#input: dataframe sequences
#input: column columnName
#input: string subsequence = "acc"
#output: dataframe result {action:join(sequences)}

def occurences(string, substring):
    count = start = 0
    while start != -1:
        start = string.find(substring, start)
        if start > -1:
            count += 1
            start += 1
    return count


processed_df = pd.DataFrame(data=sequences)
result = pd.DataFrame()

column = [occurences(elem, subsequence) for elem in processed_df[columnName]]
result['N({})'.format(subsequence)] = column
