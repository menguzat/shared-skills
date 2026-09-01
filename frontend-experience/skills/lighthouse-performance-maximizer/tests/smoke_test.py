#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, tempfile, sys

ROOT=Path(__file__).resolve().parents[1]

def report(score,lcp,tbt,cls,total,script):
    return {'lighthouseVersion':'13.0.0-fixture','finalDisplayedUrl':'https://example.test/',
      'categories':{'performance':{'score':score}},'audits':{
      'first-contentful-paint':{'numericValue':900},'speed-index':{'numericValue':1200},
      'largest-contentful-paint':{'numericValue':lcp},'total-blocking-time':{'numericValue':tbt},
      'cumulative-layout-shift':{'numericValue':cls},'server-response-time':{'numericValue':250},
      'total-byte-weight':{'numericValue':total},
      'resource-summary':{'details':{'items':[{'resourceType':'script','transferSize':script}]}}}}

def run(*args):
    return subprocess.run([sys.executable,*map(str,args)],check=True,text=True,capture_output=True).stdout

def main():
    with tempfile.TemporaryDirectory() as td:
        td=Path(td); b=td/'before'; a=td/'after'; b.mkdir(); a.mkdir()
        for i,x in enumerate([(0.92,2600,280,.08,1600000,260000),(0.93,2550,270,.075,1550000,250000),(0.94,2500,260,.07,1500000,240000)],1):
            (b/f'{i}.json').write_text(json.dumps(report(*x)))
        for i,x in enumerate([(0.97,2100,140,.04,1200000,180000),(0.96,2150,150,.045,1250000,190000),(0.97,2050,135,.04,1180000,175000)],1):
            (a/f'{i}.json').write_text(json.dumps(report(*x)))
        s=json.loads(run(ROOT/'scripts/lhr_extract.py',a))
        assert s['performance']['median']==97.0
        assert s['script_bytes']['median']==180000
        c=json.loads(run(ROOT/'scripts/compare_batches.py',b,a))
        assert c['metrics']['lcp_ms']['delta'] < 0
        budget=td/'budget.json'; budget.write_text(json.dumps({'defaults':{'performanceMedianMin':95,'lcpMsMax':2500,'tbtMsMax':200,'clsMax':.1,'totalTransferBytesMax':1300000,'jsTransferBytesMax':200000}}))
        subprocess.run([sys.executable,str(ROOT/'scripts/performance_budget_check.py'),str(budget),str(a)],check=True,capture_output=True,text=True)

        findings=td/'findings.csv'
        findings.write_text(
            'issue_id,title,impact,effort,confidence,reach,business_importance,reproducibility,regression_risk,priority_bucket,priority_score\n'
            'PERF-1,Lazy LCP hero,5,1,5,5,5,5,1,,\n'
            'PERF-2,SSR architecture,5,5,4,5,5,4,4,,\n'
            'PERF-3,Tiny unused CSS,2,2,4,5,3,5,1,,\n'
        )
        ranked=run(ROOT/'scripts/audit_rank_findings.py',findings)
        lines=ranked.strip().splitlines()
        assert 'P0 QUICK WIN' in lines[1] and 'PERF-1' in lines[1]
        assert 'P2 STRUCTURAL' in lines[2] and 'PERF-2' in lines[2]
        assert 'P4 LOW PRIORITY' in lines[3] and 'PERF-3' in lines[3]
    print('smoke test: PASS')
if __name__=='__main__': main()
