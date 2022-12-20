#name: ShowSequencesHistogram
#language: python
#tags: demo, viewers, hide-suggestions
#input: dataframe t
#input: column sequenceColumnName = Sequence
#output: graphics

import re
import matplotlib.pyplot as plt

processed_df = pd.DataFrame(data=t)
sequences = [elem for elem in processed_df[sequenceColumnName]]

splitted_sequences = [elem.split() for elem in sequences]

total = []
for i in splitted_sequences:
    total += i

final = []
# finding all the combinations of 3 elements
for elem in total:
    final += re.findall('...', elem[0:])
    final += re.findall('...', elem[1:])
    final += re.findall('...', elem[2:])

plt.hist(final, bins=55)
plt.show()