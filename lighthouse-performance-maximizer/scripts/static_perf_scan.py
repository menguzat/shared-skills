#!/usr/bin/env python3
"""Low-cost source scan for common performance hazards.
This is triage only; findings are hypotheses, never runtime proof.
"""
from pathlib import Path
import argparse,re,json

RULES=[
 ('sync-script', re.compile(r'<script(?![^>]*(?:async|defer|type=["\']module["\']))[^>]*\bsrc=',re.I), 'Potential parser-blocking external script'),
 ('lazy-high-priority', re.compile(r'<img[^>]*loading=["\']lazy["\'][^>]*fetchpriority=["\']high["\']|<img[^>]*fetchpriority=["\']high["\'][^>]*loading=["\']lazy["\']',re.I|re.S),'Image is both lazy and high priority'),
 ('autoplay-video', re.compile(r'<video[^>]*\bautoplay\b',re.I),'Autoplay video: verify product need, poster, preload and mobile cost'),
 ('data-uri-large', re.compile(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]{4000,}'),'Large inline base64 image candidate'),
 ('css-import', re.compile(r'@import\s+(?:url\()?[^;]+;',re.I),'CSS @import can add request-chain delay'),
 ('document-write', re.compile(r'\bdocument\.write\s*\('),'document.write can block parsing/loading'),
]
EXT={'.html','.htm','.jsx','.tsx','.js','.mjs','.vue','.svelte','.css','.scss'}

def files(p):
    if p.is_file(): return [p]
    return [x for x in p.rglob('*') if x.is_file() and x.suffix.lower() in EXT and 'node_modules' not in x.parts and '.git' not in x.parts]

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('path'); args=ap.parse_args(); base=Path(args.path); findings=[]
    for f in files(base):
        try: text=f.read_text(encoding='utf-8',errors='ignore')
        except: continue
        for rid,rx,msg in RULES:
            for m in rx.finditer(text):
                line=text.count('\n',0,m.start())+1
                findings.append({'rule':rid,'file':str(f),'line':line,'message':msg})
    print(json.dumps({'count':len(findings),'findings':findings},indent=2))
if __name__=='__main__': main()
