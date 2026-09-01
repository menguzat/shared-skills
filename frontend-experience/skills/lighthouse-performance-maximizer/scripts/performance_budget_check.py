#!/usr/bin/env python3
"""Check a Lighthouse report or batch median against a simple budget JSON."""
import argparse, json
from lhr_extract import collect, read_report, summarize

MAP={'performanceMedianMin':'performance','lcpMsMax':'lcp_ms','tbtMsMax':'tbt_ms','clsMax':'cls','totalTransferBytesMax':'total_bytes','jsTransferBytesMax':'script_bytes'}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('budget'); ap.add_argument('reports'); ap.add_argument('--route', default=None); args=ap.parse_args()
    budget=json.load(open(args.budget,encoding='utf-8'))
    active=dict(budget.get('defaults',{}))
    if args.route: active.update(budget.get('routes',{}).get(args.route,{}))
    rows=[read_report(p) for p in collect([args.reports])]
    if not rows: raise SystemExit('No reports')
    s=summarize(rows); failed=[]; details={}
    for rule,metric in MAP.items():
        if rule not in active: continue
        val=s.get(metric,{}).get('median'); limit=active[rule]
        if val is None: continue
        ok = val >= limit if rule.endswith('Min') else val <= limit
        details[rule]={'value':val,'limit':limit,'pass':ok}
        if not ok: failed.append(rule)
    print(json.dumps({'pass':not failed,'failed':failed,'details':details},indent=2))
    raise SystemExit(1 if failed else 0)
if __name__=='__main__': main()
