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
- [x] GitHub Pages deployed successfully

## Milestone 1A: Causal chain vertical slice (v0.2)

- [x] Cross-reality unlocks across four scenes
- [x] Persistent clue ledger and sealed corporate vault
- [x] Context-specific messages when objectives remain locked
- [x] Automated state-transition/save continuity tests
- [ ] Quest 3 headset playtesting of the existing XR lab
- [ ] Real browser tests (canvas, clicks, keyboard, error-free reload)
- [ ] Fully diegetic scene transitions, portals and shared geometry
- [ ] Manual save import/export

## Milestone 1B: Diegetic links and portable saves (v0.3)

- [x] Physical, labeled portals in each of the four 2D zones
- [x] Bidirectional portal pairs and intentional arrival locations
- [x] Persistent portal crossing count and recent-travel journal
- [x] Versioned local JSON export/import with validation and confirmation
- [x] Compatibility with previous local saves
- [x] Unit tests for portals, save round-trip, corrupted import and legacy state
- [ ] Shared 3D coordinates and diegetic gate traversal within the XR laboratory
- [ ] Real browser end-to-end tests on desktop and Quest 3

## Milestone 1: Prove the genre transition

- In-world portal gate that connects *the same place* in two perspectives
- Object-state mapping (unlock a door in one perspective; it changes another)
- Persisted per-zone enemies, health/items and a story clue ledger
- Controller-aware UI and reliable manual save export/import
- Browser automation tests for navigation, transition, state and errors

**Gate:** A tester can change genre, make a decision, return and observe its meaningful consequence.

## Milestone 1C: XR portal bridge (v0.4)

- [x] Two spatially placed, visible 3D portal gates per Experience Zone
- [x] Controller ray hit-testing: choose the gate actually aimed at
- [x] Synced portal log, arrival coordinates, active zone and evidence to browser save
- [x] On-page desktop buttons for left/right gate traversal
- [x] Cross-check XR route mappings against the 2D gate contract in automated tests
- [x] Preserve tracked headset pose with no scripted camera movement
- [ ] Quest 3 on-device test for WebXR session, controller ray, readable markers and comfort
- [ ] Physical VR locomotion, interactions and gameplay (not claimed as implemented)
- [ ] VR/2D multi-device sync beyond manual JSON import/export

## Milestone 1D: First XR play objective (v0.5)

- [x] Frontier evidence console with VR ray interaction
- [x] Recover the actual Case 001 report in the shared save
- [x] Bounded floor ray teleport target and stable in-world target marker
- [x] XR reference-space offset motion, no forced rotation or continuous acceleration
- [x] Gate, evidence, floor target priority for trigger input
- [x] Desktop button fallback for terminal interaction
- [x] Node tests for target geometry, update rules, locomotion math and legacy clues
- [ ] Physically test controller target ray and teleport on Quest 3
- [ ] Real collision, safe movement affordances and player options (snap turn, height)
- [ ] Additional fully 3D Case 001 puzzles and meaningful enemy encounters

## Milestone 1E: Dead Sector in immersive XR (v0.6)

- [x] Hospital breaker and separate medical archive visible in Dead Sector VR
- [x] Aim-trigger targeting for both devices; active target receives steady highlight
- [x] Frontier report required to activate power
- [x] Power restoration required before extracting medical countercode in XR
- [x] Shared `record` unlock across desktop game and XR, once-only health reward
- [x] 2D-compatible `deadPower` field and legacy-save migration
- [x] Browser fallback buttons and contextual lock explanations
- [x] Unit tests of state gates, targeting, idempotence and 2D persistence
- [ ] Physical Quest 3 test, including controller ray alignment and text readability
- [ ] Stateful VR enemy, combat, collision-safe teleport and immersive audio

## Milestone 1F: Underworld Sentinel Combat (v0.7)

- [x] Low-poly Sentinel body and three separate targetable conduits
- [x] Only Dead Sector countercode permits damage to Sentinel
- [x] Three-phase aimed pulse encounter, deterministic order and measured miss penalty
- [x] Persistent `sentinelPhase`, shared `enemyDown` and `crystal` state
- [x] XR ray targeting and desktop fallback buttons
- [x] Exposed core becomes the third Case 001 shard after victory
- [x] Automatic compatibility with earlier successful 2D sentinel fights
- [x] Unit tests: target geometry, ordered pulses, wrong targets, one-time core reward, legacy saves
- [ ] Quest 3 playtest with tracked controllers and accessibility/comfort review
- [ ] Proper in-headset prompts and readable spatial typography
- [ ] Full enemies, hit feedback, spatial audio, balanced combat and collision rules

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
