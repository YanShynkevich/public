#name: amino acid triplets
#language: python
#tags: demo, viewers
#input: dataframe t
#input: column xColumnName
#output: graphics

from collections import Counter
import matplotlib.pyplot as plt
import re

seq = t[xColumnName]
a = []

for s in seq:
  ss = s.split()
  for i in ss:
      a.extend(re.findall(r'[atcgATCG]{3}', i))
      a.extend(re.findall(r'[atcgATCG]{3}', i[1:]))
      a.extend(re.findall(r'[atcgATCG]{3}', i[2:]))

count = Counter(a)
plt.bar(range(len(count)), count.values())
plt.show()