# Decision Tree — Third Party

```text
Third party causes transfer/TBT/CLS
│
├─ Is it legally/product required?
│  ├─ no → remove/replace if value low
│  └─ yes
│
├─ Required before first paint?
│  ├─ yes → minimize integration; vendor/config review
│  └─ no
│
├─ Required before first interaction?
│  ├─ yes → load after critical content but before need
│  └─ no
│
├─ Consent/intent triggered?
│  └─ delay until valid trigger
│
├─ Heavy embed?
│  └─ facade/light placeholder + load on intent
│
└─ unavoidable residual cost
   └─ document accepted constraint
```
