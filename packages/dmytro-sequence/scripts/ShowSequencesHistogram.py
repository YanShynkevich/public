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

trio_sequences = [elem.split() for elem in sequences]

total = []
for i in trio_sequences:
    total += i

end = []
for elem in total:
    end += re.findall('...', elem[0:])
    end += re.findall('...', elem[1:])
    end += re.findall('...', elem[2:])

plt.hist(end, bins=55)
plt.show()