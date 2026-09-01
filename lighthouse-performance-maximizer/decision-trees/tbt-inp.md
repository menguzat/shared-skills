# Decision Tree — TBT / INP Risk

```text
TBT high or field INP poor
│
├─ Capture long tasks / interaction traces
│
├─ Startup or interaction-specific?
│  ├─ startup → bundle/hydration/third-party/init
│  └─ interaction → handler/state/layout/render/data processing
│
├─ Work necessary?
│  ├─ no → delete
│  └─ yes
│
├─ Needed now?
│  ├─ no → defer/lazy/idle/interaction trigger
│  └─ yes
│
├─ Can split/yield?
│  ├─ yes → chunk work / scheduler yield pattern
│  └─ no
│
├─ Can move off main thread?
│  ├─ yes → worker/off-main strategy
│  └─ no
│
└─ Can algorithm/render scope be reduced?
   ├─ yes → optimize
   └─ no → accepted constraint / architectural change
```
