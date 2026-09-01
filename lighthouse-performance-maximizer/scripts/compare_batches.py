#!/usr/bin/env python3
"""Compare Lighthouse report batches using medians.
Usage: python compare_batches.py before_dir after_dir
"""
from pathlib import Path
import argparse, json, statistics
from lhr_extract import collect, read_report, summarize

def med(summary,key):
    return summary.get(key,{}).get('median')

def pct(before,after):
    if before in (None,0) or after is None: return None
    return (after-before)/before*100

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('before'); ap.add_argument('after'); args=ap.parse_args()
    b=[read_report(p) for p in collect([args.before])]
    a=[read_report(p) for p in collect([args.after])]
    if not b or not a: raise SystemExit('Both batches require Lighthouse JSON files')
    bs,as_=summarize(b),summarize(a)
    metrics=['performance','fcp_ms','si_ms','lcp_ms','tbt_ms','cls','ttfb_ms','total_bytes','script_bytes']
    out={'before_count':len(b),'after_count':len(a),'metrics':{}}
    for k in metrics:
        bv,av=med(bs,k),med(as_,k)
        out['metrics'][k]={'before_median':bv,'after_median':av,'delta':(av-bv) if bv is not None and av is not None else None,'pct_delta':pct(bv,av)}
    print(json.dumps(out,indent=2))
if __name__=='__main__': main()
