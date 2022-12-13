#name: CountSubsequencePythonDataframe
#description: Counts sequence occurences in dataframe
#language: python
#input: dataframe sequences
#input: column columnName
#input: string subsequence = "acc"
#output: dataframe result {action:join(sequences)}

processed_df = pd.DataFrame(data=sequences)
result = pd.DataFrame()

column = [elem.count(subsequence) for elem in processed_df[columnName]]
result['N({})'.format(subsequence)] = column
