## Description: <br>
Generate video using Google Veo (Veo 3.1 / Veo 3.0). <br>

This skill is ready for commercial/non-commercial use. <br>

## Publisher: <br>
[buddyh](https://clawhub.ai/user/buddyh) <br>

### License/Terms of Use: <br>


## Use Case: <br>
Developers and creators use this skill to generate MP4 video clips from text prompts, with optional reference images, through Google's Veo API. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Prompts and optional reference images are sent to Google's Veo/Gemini API, and an image path can upload a local file selected by the caller. <br>
Mitigation: Use only non-sensitive prompts and verified image files; do not allow untrusted prompts or users to choose --input-image paths. <br>


## Reference(s): <br>
- [ClawHub skill page](https://clawhub.ai/buddyh/skills/veo) <br>


## Skill Output: <br>
**Output Type(s):** [Files, Shell commands, Guidance] <br>
**Output Format:** [MP4 video file with terminal status text] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [Requires uv and GEMINI_API_KEY; optional reference images may be sent to Google's API.] <br>

## Skill Version(s): <br>
1.3.0 (source: server release metadata) <br>

## Ethical Considerations: <br>
Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment. <br>
