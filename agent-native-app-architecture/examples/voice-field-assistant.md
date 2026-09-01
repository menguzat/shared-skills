# Worked Example: Voice-First Field Inspection Assistant

## Environment

Inspector is mobile, wearing gloves, and frequently cannot type. Exact readings and photo evidence still need visual verification.

## Interaction architecture

Voice = primary intent/input channel.

Visual UI = persistent inspection state, readings, photos, anomalies, and approval.

## Flow

Inspector:

> Start inspection for pump station 7.

System opens a fixed inspection workspace with:

- asset identity
- checklist progress
- current readings
- photo slots
- flagged anomalies

Inspector:

> Pressure is 6.8 bar, vibration is higher than yesterday, add a note that the coupling sounds rough.

Agent parses the statement into proposed structured fields.

UI shows:

- Pressure: 6.8 bar
- Vibration: qualitative increase — needs value if policy requires one
- Note: coupling sounds rough

If an exact vibration measurement is mandatory, the agent asks only for that missing value.

Inspector can correct by voice or tap.

## Anomaly handling

If thresholds indicate a potentially serious issue:

- do not hide it in prose
- show a high-salience state in the workspace
- surface relevant evidence
- ask for required confirmation/escalation according to policy

## Completion

Agent prepares inspection report.

Persistent artifact contains:

- structured measurements
- photos
- notes
- anomaly summary
- corrective actions

Final submission requires explicit review if policy requires it.

## Key design rule

Do not read long tables aloud. Voice announces important exceptions; screen carries dense state.
