# LENZ Field Test Protocol — Case 001 / v0.10

## Goal

Verify that a first-time tester can complete the entire Case 001 prototype in an actual immersive VR session, understand the transitions, and read the corporate vault ending **without coaching**.

A GitHub Actions green check is necessary but insufficient. Static tests prove modeled state transitions, not motion comfort, visual clarity, WebXR controller correctness or Quest 3 compatibility.

## Starting conditions

1. Back up your existing progress using **Export Save** on the browser game (index.html). This is a separate file from QA report exports.
2. Use the same origin and browser profile while navigating among index.html, xr.html and qa.html. Separate PCs and headsets do not automatically share local storage.
3. On the headset, open xr.html over HTTPS in Quest Browser and confirm you have enough clear physical space. Do not rely on virtual walls as safety barriers.
4. Open **Field Test Lab** (qa.html) outside immersive mode and choose your test device. All 12 checks are **manual**; game flags are only supporting evidence.
5. If you want approximate XR frame timing, **explicitly tick** the sampling checkbox on xr.html before starting the immersive session. Sampling is off by default.

## Primary route

| Sequence | Experience | Action | Acceptance |
|---|---|---|---|
| 1 | Quest entry | Enter VR, turn head, exit/reenter | Stable pose, no crashes, tracked headset |
| 2 | Any | Aim down and teleport | Valid marker only inside bounds; no forced rotation |
| 3 | Frontier | Aim at gate openings and scanner | Only intended target highlights and triggers |
| 4 | Frontier | Scan access-code terminal | Exactly one report clue |
| 5 | Dead Sector | Traverse Hospital, restore power, open archive | Countercode persists |
| 6 | Underworld | Traverse Sublevel, disable sentinel center → left → right | Three correct stages, enemy stays defeated |
| 7 | Underworld | Scan exposed stabilizer core | Third clue, once only |
| 8 | Fracture | Traverse Fault Line, repair anchors left → right → center | Repair phases remain after reload |
| 9 | Fracture | Extract vault coordinates | Fourth clue |
| 10 | Frontier | Return via Breach, decode vault, open door | Canonical Case 001 completion flag |
| 11 | Frontier | Read the in-world directive | **THE SUBJECT IS THE PRODUCT** legible and stationary |
| 12 | Browser | Reload, inspect saves, export/import backup | Progress retained without gameplay reset |

Record actual failure locations, which controller was used, whether the target was obviously selectable, text readability, comfort (including seated if tested), and whether the page survived leaving immersive mode. Do not claim a Pass when the step was only completed using desktop buttons.

## Negative test cases

- Visit Dead Sector before recovering the Frontier code: the breaker/archive must reject premature access.
- Attempt the Sentinel without the medical countercode: immunity message appears; no phase advancement.
- Trigger a wrong shield conduit: the phase remains fixed, bounded health penalty only.
- Attempt Fracture anchors before claiming the stabilizer: the bridge remains unpowered.
- Attempt the Frontier decoder before acquiring all four clues: no bypass.
- Repeat an already claimed shard and already completed vault: no duplicated rewards.
- Export a save, reset **only when the backup is secured**, import and verify all existing clues and ending states return.
- In Field Test Lab, clear QA answers and verify the actual LENZ save remains intact.

## Performance and safety notes

XR sampling intentionally saves only one aggregate snapshot of up to 2,400 valid frame intervals. The resulting approximate callback FPS and p95 interval are indicative, not a formal device refresh-rate, latency, thermals or comfort certification. No headset pose coordinates, camera video, precise location, user-agent fingerprint, private save content or account identifiers are recorded in the summary.

An exported QA report contains self-reported device category, manually entered notes, manual statuses, sanitized gameplay milestone booleans and basic capability checks. **Nothing is transmitted automatically.** The tester should review free text before attaching a report to a GitHub issue.

If a participant becomes uncomfortable, stop the headset test. Do not continue testing to satisfy a numeric checklist.

## Issue triage

| Priority | Example |
|---|---|
| **P0 / showstopper** | Browser cannot launch XR or crashes reliably; data loss or unsafe forced camera motion |
| **P1 / major** | Cannot aim at the required portal/device; missing quest unlock; text impossible to read |
| **P2 / moderate** | Confusing route, inconsistent highlights, occasional missed target, inaccurate diagnostics |
| **P3 / minor** | Text polish, spacing, documentation or cosmetic issues |

Open a new GitHub issue with the failed checklist step, expected and observed behavior, safe reproduction instructions and relevant exported report (after review). Do **not** share private browser logs or saved data by default.

## Release gate

**Do not mark Quest 3 ready** until at least one documented physical headset run demonstrates the complete path to the vault with usable targeting and acceptable comfort, followed by a second run confirming save/reload persistence. CI passing alone never satisfies this gate.
