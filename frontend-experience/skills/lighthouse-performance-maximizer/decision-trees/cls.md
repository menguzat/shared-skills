# Decision Tree — CLS

```text
CLS too high
│
├─ Use layout-shift attribution
│
├─ Unsized media/embed?
│  └─ reserve dimensions/aspect ratio/container
│
├─ Late banner/widget?
│  └─ reserve slot / overlay / insert below stable content
│
├─ Font shift?
│  └─ font-display + metric-compatible fallback + subset/preload as needed
│
├─ Hydration mismatch?
│  └─ make SSR/client geometry consistent
│
├─ Animation moves layout?
│  └─ transform/opacity or reserve geometry
│
└─ Post-load interaction shift?
   └─ reproduce full lifecycle; don't audit initial load only
```
