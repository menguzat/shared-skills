## Description: <br>
Minimalist guides coding agents to solve tasks with the smallest correct change by deleting speculative scope, reusing existing code or platform features, and preserving safety guardrails. <br>

This skill is ready for commercial/non-commercial use. <br>

## Publisher: <br>
[divyeshjayswal](https://clawhub.ai/user/divyeshjayswal) <br>

### License/Terms of Use: <br>
MIT-0 <br>


## Use Case: <br>
Developers and engineers use this skill during coding tasks to steer an agent toward deleting speculative requirements, reusing existing code or platform features, and writing only the minimum safe change. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: The skill may push back on speculative scope or dependency additions that a user actually wants. <br>
Mitigation: State required scope explicitly or select a lighter intensity level when broader implementation is intentional. <br>
Risk: The skill remains active across coding replies until disabled, which may bias later tasks toward minimal changes. <br>
Mitigation: Disable the posture with the documented off command before tasks that require exploratory design or broader refactoring. <br>


## Reference(s): <br>
- [ClawHub skill page](https://clawhub.ai/divyeshjayswal/skills/minimalist) <br>


## Skill Output: <br>
**Output Type(s):** [text, markdown, code, shell commands, configuration, guidance] <br>
**Output Format:** [Markdown or plain text guidance, sometimes with code snippets and shell commands] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [Applies a persistent coding-response posture until the user disables it.] <br>

## Skill Version(s): <br>
1.0.0 (source: release metadata) <br>

## Ethical Considerations: <br>
Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment. <br>
