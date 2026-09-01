#!/usr/bin/env python3
"""Extract key metrics from one or more Lighthouse JSON reports.

Usage:
  python lhr_extract.py reports/*.json
  python lhr_extract.py reports/ --format csv
"""
from pathlib import Path
import argparse, json, statistics, csv, sys

METRICS = {
    'performance': ('category','performance'),
    'fcp_ms': ('audit','first-contentful-paint'),
    'si_ms': ('audit','speed-index'),
    'lcp_ms': ('audit','largest-contentful-paint'),
    'tbt_ms': ('audit','total-blocking-time'),
    'cls': ('audit','cumulative-layout-shift'),
    'ttfb_ms': ('audit','server-response-time'),
    'total_bytes': ('audit','total-byte-weight'),
}


def collect(paths):
    files=[]
    for raw in paths:
        p=Path(raw)
        if p.is_dir(): files.extend(sorted(p.rglob('*.json')))
        elif p.exists(): files.append(p)
    return files

def read_report(p):
    d=json.loads(p.read_text(encoding='utf-8'))
    out={'report_path':str(p),'url':d.get('finalDisplayedUrl') or d.get('finalUrl') or d.get('requestedUrl',''),
         'lighthouse_version':d.get('lighthouseVersion','')}
    cats=d.get('categories',{})
    audits=d.get('audits',{})
    score=cats.get('performance',{}).get('score')
    out['performance']=round(score*100,2) if isinstance(score,(int,float)) else None
    for key, spec in METRICS.items():
        if key=='performance': continue
        a=audits.get(spec[1],{})
        val=a.get('numericValue')
        out[key]=val if isinstance(val,(int,float)) else None
    # Resource Summary is a table audit; derive script transfer bytes when present.
    script_bytes = None
    items = audits.get('resource-summary',{}).get('details',{}).get('items',[])
    if isinstance(items,list):
        for item in items:
            if str(item.get('resourceType','')).lower() == 'script':
                v=item.get('transferSize')
                if isinstance(v,(int,float)):
                    script_bytes=v
                    break
    out['script_bytes']=script_bytes
    return out

def percentile(vals, q):
    vals=sorted(vals)
    if not vals: return None
    if len(vals)==1: return vals[0]
    x=(len(vals)-1)*q
    lo=int(x); hi=min(lo+1,len(vals)-1); f=x-lo
    return vals[lo]*(1-f)+vals[hi]*f

def summarize(rows):
    keys=['performance','fcp_ms','si_ms','lcp_ms','tbt_ms','cls','ttfb_ms','total_bytes','script_bytes']
    s={'count':len(rows)}
    for k in keys:
        vals=[r[k] for r in rows if isinstance(r.get(k),(int,float))]
        if vals:
            s[k]={'median':statistics.median(vals),'p25':percentile(vals,.25),'p75':percentile(vals,.75),'min':min(vals),'max':max(vals)}
    return s

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('paths', nargs='+')
    ap.add_argument('--format', choices=['json','csv'], default='json')
    ap.add_argument('--rows', action='store_true', help='emit individual rows rather than summary')
    args=ap.parse_args()
    files=collect(args.paths)
    if not files:
        raise SystemExit('No JSON reports found')
    rows=[read_report(p) for p in files]
    if args.rows:
        if args.format=='json': print(json.dumps(rows,indent=2))
        else:
            wr=csv.DictWriter(sys.stdout,fieldnames=list(rows[0].keys())); wr.writeheader(); wr.writerows(rows)
    else:
        print(json.dumps(summarize(rows),indent=2))
if __name__=='__main__': main()
