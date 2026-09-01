#!/usr/bin/env python3
"""Simple descriptive analyzer for coded-results.csv. No causal claims."""
import csv, sys
from collections import defaultdict

def truth(v): return str(v).strip().lower() in {'1','true','yes','y'}
if len(sys.argv)<2:
 print('usage: analyze_results.py coded-results.csv'); raise SystemExit(2)
rows=list(csv.DictReader(open(sys.argv[1], newline='', encoding='utf-8')))
g=defaultdict(lambda:[0,0,0,0,0])
for r in rows:
 k=(r.get('engine',''),r.get('model',''))
 a=g[k]; a[0]+=1; a[1]+=truth(r.get('target_retrieved')); a[2]+=truth(r.get('target_cited')); a[3]+=truth(r.get('target_mentioned')); a[4]+=truth(r.get('target_recommended'))
print('engine	model	n	retrieved	cited	mentioned	recommended')
for (e,m),a in sorted(g.items()): print(e,m,*a,sep='	')
