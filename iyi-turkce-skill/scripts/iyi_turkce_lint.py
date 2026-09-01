#!/usr/bin/env python3
"""
Conservative Turkish style candidate linter.

This tool flags candidates for human/agent review.
It does NOT prove that a phrase is wrong and MUST NOT auto-rewrite source text.
"""
from __future__ import annotations
import argparse, re, sys
from pathlib import Path

RULES = [
    ("semantic-duplication", r"\bbu\s+neden(?:den|le)\s+(?:dolayı|ötürü)\b", "Cause may be expressed twice; review."),
    ("semantic-duplication", r"\bzaman\s+süresi\b", "Often 'süre' is enough."),
    ("semantic-duplication", r"\byaklaşım\s+tarz\w*\b", "Often 'yaklaşım' already carries manner."),
    ("semantic-duplication", r"\bbeklenmedik\s+sürpriz\b", "Often redundant unless rhetorical."),
    ("possibility-duplication", r"\b\w+(?:abilmek|ebilmek)\s+mümkün(?:dür)?\b", "Possibility may be expressed twice."),
    ("possibility-duplication", r"\b\w+(?:abileceği|ebileceği)\s+(?:ihtimali|olasılığı)\b", "Possibility may be expressed twice."),
    ("possible-calque", r"\byönelik\s+olarak\b", "May be removable/restructurable; inspect relation."),
    ("possible-calque", r"\baktif\s+olarak\b", "May be natural or calqued; inspect."),
    ("possible-calque", r"\bstratejik\s+olarak\b", "May be natural or calqued; inspect."),
    ("formal-register", r"\bhalihazırda\b", "Review whether a plainer current-time expression fits."),
    ("formal-register", r"\biçerisinde\b", "Review whether 'içinde' is sufficient."),
    ("weak-verb", r"\b(?:çalışma|analiz|değerlendirme|iyileştirme|kontrol)\s+yap(?:mak|ıldı|ılıyor|ılacak|ıyoruz|ıyor)\b", "A more precise/simple verb may exist."),
    ("filler-copy", r"\bgeleceği\s+şekillendir", "Generic brand phrase; require a concrete proposition."),
    ("filler-copy", r"\bfark\s+yarat", "Generic claim; require specificity."),
    ("filler-copy", r"\bdoğadan\s+ilham\s+al", "Generic unless grounded in a specific mechanism."),
]

def lint(text: str):
    out=[]
    for category, pattern, note in RULES:
        for m in re.finditer(pattern, text, flags=re.I|re.U):
            line = text.count("\n", 0, m.start()) + 1
            out.append((line, category, m.group(0), note))
    # Long sentence heuristic.
    offset=0
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        words=re.findall(r"\b[\wçğıöşüÇĞİÖŞÜ'-]+\b", sentence, flags=re.U)
        if len(words) >= 35:
            line=text.count("\n",0,offset)+1
            out.append((line,"long-sentence",f"{len(words)} words","Inspect sentence skeleton; length alone is not an error."))
        offset += len(sentence)+1
    return sorted(out)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("path", help="Text/Markdown file")
    ap.add_argument("--fail-on-findings", action="store_true")
    args=ap.parse_args()
    p=Path(args.path)
    text=p.read_text(encoding="utf-8")
    findings=lint(text)
    if not findings:
        print("No candidate issues found.")
        return 0
    print("line\tclass\tmatch\tnote")
    for row in findings:
        print("\t".join(map(str,row)))
    return 2 if args.fail_on_findings else 0

if __name__ == "__main__":
    raise SystemExit(main())
