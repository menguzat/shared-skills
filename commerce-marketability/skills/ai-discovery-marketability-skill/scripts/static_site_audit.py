#!/usr/bin/env python3
"""Static heuristic audit for common SEO/AI-discovery implementation risks.
Not a crawler, index checker, ranking predictor, or structured-data validator.
"""
import re, sys, json
from pathlib import Path

EXT={'.html','.htm','.jsx','.tsx','.vue','.svelte','.astro','.js','.ts'}
PATTERNS={
 'noindex': re.compile(r'noindex', re.I),
 'canonical': re.compile(r'rel=["\']canonical["\']', re.I),
 'jsonld': re.compile(r'application/ld\+json', re.I),
 'h1': re.compile(r'<h1\b', re.I),
 'img_missing_alt': re.compile(r'<img\b(?![^>]*\balt=)[^>]*>', re.I|re.S),
 'button_div': re.compile(r'<div[^>]*(?:onclick|onClick)=', re.I),
 'meta_description': re.compile(r'<meta[^>]+name=["\']description["\']', re.I),
}

def files(path):
 p=Path(path)
 if p.is_file(): return [p]
 return [x for x in p.rglob('*') if x.suffix.lower() in EXT and x.is_file()]

def main():
 if len(sys.argv)<2:
  print('usage: static_site_audit.py <file-or-directory>'); return 2
 out=[]
 for p in files(sys.argv[1]):
  try: t=p.read_text(errors='ignore')
  except Exception: continue
  hits={k:len(rx.findall(t)) for k,rx in PATTERNS.items()}
  findings=[]
  if hits['noindex']: findings.append('contains noindex: verify intentional')
  if p.suffix.lower() in {'.html','.htm'} and not hits['canonical']: findings.append('no canonical found')
  if p.suffix.lower() in {'.html','.htm'} and not hits['h1']: findings.append('no h1 found')
  if hits['img_missing_alt']: findings.append(f"{hits['img_missing_alt']} img tag(s) missing alt")
  if hits['button_div']: findings.append('click handler on div: inspect semantics/agent accessibility')
  if findings: out.append({'file':str(p),'findings':findings})
 print(json.dumps(out,indent=2))
 return 0
if __name__=='__main__': raise SystemExit(main())
