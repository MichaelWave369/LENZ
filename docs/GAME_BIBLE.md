# LENZ — Game Bible (living v0.7)

> **One world. Infinite perspectives.**

## Origin and creative credit

Shayne's dream-game pitch described an adventure that combines platforming, shooters, side-scrolling, mystery-thriller, survival horror, open-world exploration and isometric dungeon combat: *a new experience at every turn*. Shayne proposed the name **LENZ**. The idea to make **L.E.N.Z.** a sinister corporation emerged in the subsequent creative discussion.

These influences describe genre expectations, not permission to reuse other games' copyrighted characters, assets, level designs or trademarks.

## The two meanings of LENZ

- **LENZ** is the player's mysterious optical interface and the name of the game.
- **L.E.N.Z.** is the **Laboratory for Experiential Neurorealities and Zoning**, an immense corporation that monetized and weaponized synthetic experiences.
- Its public promise: **"Reality is what we make it."**
- Its hidden objective: observe adaptation, reaction and obedience across incompatible simulated realities.

The facility experiments with **Experience Zones**, each with a distinct genre grammar. Something has caused the zones to bleed together. An object moved in one genre can alter a path in another. The protagonist discovers they may be a test subject, and the corporation may be trapped within its own experiment.

**Core story question:** If perceptions can be rewritten, what remains true?

## Non-negotiable gameplay principles

1. **One persistent player.** Health, inventory, discoveries, choices and relationships persist across perspectives.
2. **Diegetic transitions.** Switching mode should eventually have an understandable in-world cause, not feel like loading unrelated demos.
3. **Each genre stands on its own.** Horror needs tension, platforming needs precise movement, RPG combat needs readable decisions, and mysteries require solvable clues.
4. **A meaningful outside world.** The world should react to discoveries, including effects from seemingly small side missions.
5. **No forced monetization or lock-in.** Save locally and support exports in later milestones.
6. **VR must honor the player.** No forced camera rotations, unexpected acceleration, or physical-space assumptions.

## Experience Zone design

| Zone | Genre | Primary verbs | Story purpose |
|---|---|---|---|
| Z-01 Frontier | Open-world exploration | roam, scan, scavenge, speak | Introduce the world and first anomaly |
| Z-02 Dead Sector | Survival horror | hide, survive, ration, investigate | Expose the human cost of the experiments |
| Z-03 Underworld | Isometric combat | fight, equip, strategize | Reveal the reality engine's structure |
| Z-04 The Fracture | Side-scrolling platforming | jump, time, navigate | Show spatial reality itself is editable |
| Z-05 Blackout (planned) | First-person shooter | aim, flank, improvise | Confront corporate enforcement |
| Z-06 The Forgotten (planned) | Detective mystery | examine, connect, deduce | Uncover the corporation's origin |
| Z-07 Collapse (planned) | Open-world survival | craft, build, protect | Unite zones and survivor communities |

### Example sequence

The player explores an abandoned rural town in Frontier and finds a sealed hospital. Inside, the same physical location becomes Dead Sector horror. The basement projects an Underworld dungeon schematic. An unstable maintenance shaft transforms into a side-scrolling platform section. What the player recovers in each reality changes the original town.

## Cross-reality consequence chain (v0.2)

The first connected case has five real dependencies, not just flavor text:

1. **Frontier:** Reading the anomaly report recovers a code that unlocks the Dead Sector archive.
2. **Dead Sector:** The recovered medical record reveals the Underworld sentinel's weakness.
3. **Underworld:** Defeat the sentinel with the countercode, then collect its shielded stabilizer core.
4. **The Fracture:** The core enables the last raised platform and access to coordinates.
5. **Frontier:** The coordinates unlock the corporate vault and a hidden directive: **"THE SUBJECT IS THE PRODUCT."**

A persistent Case 001 panel shows the next objective, recovered evidence and final-file state. Blocked objectives explain the required prerequisite. The corporate directive is a final narrative flag, not an extra data shard. The separate WebXR dioramas do not yet contain these interactions.

## World-connected Thresholds (v0.3)

The player's next perspective is now accessible through eight visible, spatially paired threshold gates. Four named sites form a loop: **Hospital** (Frontier ↔ Dead Sector), **Sublevel** (Dead Sector ↔ Underworld), **Fault Line** (Underworld ↔ Fracture), and **Breach** (Fracture ↔ Frontier). At each threshold, the player explicitly presses E and appears at a mapped arrival point. The position is intentionally shifted away from some gates to avoid accidental re-entry, and the ability to jump around using the old experimental reality selector is preserved.

A **Threshold Journal** logs recent crossings and the persistent number of total crossings. This is not yet shared walkable 3D space; it's the first stage of in-world narrative geography connecting four different game mechanics.

**Player data sovereignty:** A versioned JSON file can be exported and imported locally without accounts or servers. Imports are opt-in with confirmation, format validation, size limits, known-field sanitization and supported save migration. Keep production and demo saves backed up before resetting progress.

## XR world portal contract (v0.4)

The stationary VR laboratory now offers two visibly separate low-poly, numbered gates. A controller's real WebXR target ray must intersect a gateway to activate it via trigger. The same named site pairs, arrival coordinates and persisted `portalLog` contract used in 2D now govern XR crossing. The current zone, Case 001 shard/vault status, and player health are preserved. This is an additive interoperability milestone, not evidence that 2D and VR share a 3D physics/collision world.

**Safety and comfort:** The view remains headset-tracked, no camera automation or locomotion. If a controller cannot provide a ray, no portal is silently selected. Point-and-click desktop fallback is provided. Device support and performance need real Quest 3 testing.

**Data locality:** Web storage is shared across pages on the same origin and browser profile only. On separate devices, import/export the saved JSON manually.

## First immersive playable objective (v0.5)

**Frontier 3D terminal:** A marked console between the two existing gates is the first headset interaction tied to a campaign consequence. A controller ray must intersect the visible console to recover `flags.report`. This is the same clue the 2D game uses to unlock Dead Sector, so it can be earned in either presentation without duplicate rewards.

**Comfort traversal:** The same controller can aim at a bounded floor plane, displaying a still cyan preview square and, on trigger, relocating by a WebXR reference-space offset. Headset pose tracking and player-chosen orientation are preserved; there is no scripted camera tween, artificial acceleration or forced turning. The player must observe real-world boundaries; virtual geometry does not constitute a collision or safety system.

**Scope honesty:** This is a limited interactive 3D slice, not the full campaign or fully immersive open world. Quest 3 test results are not claimed until an actual device playtest is documented.

## Hospital security and Case 001 medical archive (v0.6)

The first **two-scene VR quest chain** is functional. Frontier provides the code. Dead Sector's separately targeted red breaker powers its medical archive. The archive awards the existing Case 001 medical record, whose sentinel countercode changes the 2D Underworld's available combat outcomes. Both breaker's state (`deadPower`) and recovered record (`record`) are durable in the shared save, and duplicate interactions do not award duplicate rewards.

The 2D medical archive still requires only the Frontier code, because it represents an abstracted interaction; completing it also marks hospital power restored. Old saves with `record` imply `deadPower` when loaded. The VR puzzle adds meaningful physical interaction without breaking earlier 2D gameplay.

**Deliberate omissions:** No artificially moving horror enemy, headset-controlled weapon, jumpscare or forced camera motion has been included. Headset testing is an open acceptance criterion. A low-poly corridor and two consoles do not constitute a finished Resident Evil-style horror sequence.

## Underworld: Countercode Sentinel (v0.7)

The first VR combat mechanic is a **three-phase shield-disabling encounter**. Recovering Dead Sector's medical record renders the Sentinel vulnerable. The player physically aims at distinct conduits in the order **center → left → right**. Correct hits disable each node; incorrect hits impose a small, bounded loss of player vitals. The player may retreat, reload or switch perspectives without resetting shield progress, which is stored as `sentinelPhase`.

After the third pulse, `enemyDown` becomes true, matching the 2D game’s established sentinel defeat flag. Its exposed stabilizer (`flags.crystal`) can then be recovered in XR, enabling the final platform in The Fracture. A previously defeated Sentinel from 2D counts as down when entering VR, so no one loses progress.

The encounter is intentionally **stationary and comfort-oriented**, with no forced rotations, hurt-camera, flashes or involuntary motion. The opponent does not yet navigate the space, chase players, fire projectiles or implement advanced AI. Testing on physical Quest hardware remains outstanding.

## First prototype's scope (v0.1)

The root page implements **four small, visually distinct playable 2D scenes**, selectable with Q, numbered keys or on-screen controls. It persists health, recovered files, zone visitation and positions in localStorage. Exploration, an approaching horror enemy, dungeon attack and platforming are implemented as deliberately small mechanical sketches.

The **XR Laboratory** is a separate native WebXR/WebGL proof of concept: a stationary room-scale scene displaying four different stylized 3D worlds, with controller trigger to switch reality. It does **not yet** implement the full desktop game's movement or combat in VR. Its value is proving immersive browser rendering and genre changes without camera coercion.

### Story state and evidence

Recover four prototype clues: the Frontier anomaly report, Dead Sector medical record, Underworld core and Fracture stability shard. Vitals and collected evidence travel between zones. The final state is a prototype narrative reveal, not the finished game's ending.

### Player comfort

The WebXR scene uses the headset's tracked view with no scripted locomotion or camera rotation. Later motion features must offer snap turn, teleport locomotion, seated/standing options, comfort vignette controls, height calibration and clear interaction affordances. Quest 3 testing is a target, **not a claim of certification**.

## Accessibility and trust

Keyboard controls and clickable alternative controls exist; on-screen directional controls appear on coarse-pointer displays. Motion and audio should not be required to understand critical information. No analytics, mandatory sign-in, external fonts, remote scripts or ads. Future design needs remappable controls, text size, subtitles, save export and a robust controller mapping.

## Technology direction

Start from a dependency-free, static browser foundation to minimize deployment complexity. Introduce larger tools only when a specific vertical slice proves the need. Evaluate Domistika, BTM, FrameFieldStudio, PhiOS XR and BackyardProductionCompany as **optional future integrations**. No unverified compatibility or shared runtime is assumed.

## Tone and identity

Unsettling corporate sci-fi, curiosity over shock, systemic surprises over random genre roulette. The antagonists see humans as data points; the game should make players feel like people whose decisions matter.

*Status: concept and early prototype. Major plot, setting, character designs and final acronym remain editable creative decisions.*
