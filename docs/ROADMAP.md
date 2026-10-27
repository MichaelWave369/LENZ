# LENZ — Test-first development roadmap

## Milestone 0: Vertical-slice proof of concept (in this PR)

- [x] Repository and narrative design bible
- [x] Interactive Frontier field survey
- [x] Interactive Dead Sector survival sketch
- [x] Interactive Underworld combat sketch
- [x] Interactive Fracture platforming sketch
- [x] Shared local save state across zone changes
- [x] Experimental native WebXR diorama scene and trigger-based lens change
- [x] GitHub Actions syntax/smoke checks and Pages deployment workflow
- [ ] Physical Quest 3 hands-on acceptance testing
- [ ] GitHub Pages activated in repository Settings

## Milestone 1: Prove the genre transition

- In-world portal gate that connects *the same place* in two perspectives
- Object-state mapping (unlock a door in one perspective; it changes another)
- Persisted per-zone enemies, health/items and a story clue ledger
- Controller-aware UI and reliable manual save export/import
- Browser automation tests for navigation, transition, state and errors

**Gate:** A tester can change genre, make a decision, return and observe its meaningful consequence.

## Milestone 2: Expand immersive play

- Quest 3 WebXR input mappings with hand/controller selection
- Native 3D exploration in a small location (not just stationary dioramas)
- Teleport + snap turning before any smooth locomotion
- Comfort controls, options menu, safe reset and headset recentering
- Frame-time budgets and performance profiling on device
- Equivalent objective/progress between 2D and VR where feasible

**Gate:** A person can complete a short continuous objective in VR comfortably and independently.

## Milestone 3: Craft a compelling game

- First-person shooter combat slice (Blackout)
- Evidence-based mystery slice (The Forgotten)
- Narrative transitions, sound design and world-reactive state
- Original art and soundtrack pipeline with explicit asset provenance
- Intro, ending, onboarding and accessibility pass
- Closed playtest with Shayne and external testers

**Gate:** Three people who did not build the game complete the slice without coaching and describe why the genre changes matter.

## Milestone 4: Community and interoperability

- Optional import/export bridge with suitable existing ecosystem projects
- Documentation for creators to author Experience Zones
- Offline distribution and versioned save migrations
- Open source governance, credits, contribution guide and compatibility review
- Check the LENZ name against relevant existing game titles/trademarks before public marketing.

## Manual acceptance checklist

### Desktop
1. Open index.html through a local HTTP server or its GitHub Pages URL.
2. Move in Frontier with WASD. Retrieve the cyan report with E.
3. Press Q; move through Dead Sector and observe the pursuing hunter.
4. Change to Underworld, approach the sentinel, press Space and recover the core.
5. Change to Fracture, jump through platforms and collect the elevated shard.
6. Reload; verify recovered clues and current zone persist.
7. Reset save; verify health, inventory and discovery count reset.
8. Test mobile touch controls and a gamepad where available.

### Quest 3
1. Navigate to the **HTTPS** Pages deployment using Quest Browser.
2. Open XR Laboratory, confirm the 3D desktop preview is visible if supported.
3. Enter immersive VR through the headset permission dialog.
4. Turn your head: the viewpoint follows tracking naturally.
5. Press a controller trigger: zone palette and geometry change.
6. Exit from the headset UI; the web page stays responsive.
7. Return to the game page and confirm the chosen zone was saved.

**Known limitations:** no audio; no finished campaign; no full VR gameplay, AI opponents in XR, user-controlled VR locomotion, collision geometry, remapping or save migrations yet.
