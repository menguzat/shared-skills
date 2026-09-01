# Workflow — Authenticated Routes

- create stable non-personal test account;
- script login/setup once per clean profile or use supported storage-state approach;
- ensure audited URL is the actual authenticated route;
- stabilize test data volume;
- record role/permissions;
- include critical interactions in field/RUM testing;
- do not expose credentials in reports or committed files.

If authentication cannot be automated safely, audit public shell separately and document the coverage gap.
