# LENZ
### ONE WORLD. INFINITE PERSPECTIVES.

**LENZ** is an original, open-source, genre-shifting adventure prototype. Shayne imagined a game that could move between shooters, horror, platformers, open-world exploration and isometric dungeon combat, with a new experience at every turn. He named it **LENZ**. The game's fiction revolves around **L.E.N.Z.**, the *Laboratory for Experiential Neurorealities and Zoning*, a corporation whose simulated realities have begun merging.

> “Reality is what we make it.” — L.E.N.Z. Corporation

## Play the prototype

Live browser build (after the PR is merged and Pages redeploys):

**https://michaelwave369.github.io/LENZ/**

Until then, you can serve the repository with a local static server, e.g. `python -m http.server 8000`, and open http://localhost:8000.

| Experience | Prototype gameplay |
| --- | --- |
| Z-01 Frontier | Move around a field environment and retrieve an anomaly report |
| Z-02 Dead Sector | Avoid a pursuing hunter, use an emergency pulse, retrieve a medical record |
| Z-03 Underworld | Isometric dungeon movement, one sentinel encounter and a recoverable core |
| Z-04 The Fracture | Jump across platforms and claim the elevated shard |

Use **WASD or arrows** to move, **E** to interact, **Space** for the current zone's action, **Q** to change the reality lens, or **1–4** to select a zone. On-screen buttons, touch controls and basic gamepad buttons are available. Recover four data shards. **Health, zone, positions and discoveries persist in your browser's local storage**; Reset Save clears this progress.

### XR Laboratory

Open [XR Laboratory](xr.html) for the separate WebGL preview / native WebXR proof of concept.

- On desktop, view low-poly 3D representations of four worlds.
- On a compatible headset with an HTTPS context (target: **Meta Quest 3**), enter **immersive VR** and press a controller trigger to change zones.
- This version uses a stationary tracking-based view; it intentionally has **no artificial VR locomotion**.
- **Not a full VR port of the game yet.** Quest performance and support need hands-on verification.

## Case 001: The first connected world (v0.2)

The first genre-chain now has consequences: **Frontier's access code** unlocks **Dead Sector's archive**, whose **countercode** allows the **Underworld sentinel** to be defeated. Recover its **stabilizer core** to create the last platform in **The Fracture**. Retrieve the coordinates and return to **Frontier** to open a hidden L.E.N.Z. vault.

The in-game **Case 001** panel tells you what to do next and which evidence is still missing. The corporate vault unlock is the final narrative objective after collecting four zone shards. Saved progress carries across the genres. The VR laboratory remains a separate visual and interaction experiment.

## Threshold Gates and portable progress (v0.3)

Walk up to a cyan oval **threshold gate** and press **E** to cross realities. A paired gate in the destination scene can return you to the same named location. Gates are currently drawn in four 2D scenes: **HOSPITAL** (Frontier ⇄ Dead Sector), **SUBLEVEL** (Dead Sector ⇄ Underworld), **FAULT LINE** (Underworld ⇄ Fracture), and **BREACH** (Fracture ⇄ Frontier). The zone selector, Q and keys 1–4 remain optional developer-friendly shortcuts.

Every physical crossing records an entry in the **Threshold Journal** and counts toward **Gates Crossed**. Gate arrivals are mapped intentionally and all Case 001 evidence persists. This is a spatially linked prototype; it does **not** yet represent seamless shared 3D geometry.

For local-first ownership, **Export Save** downloads `LENZ-case-001-save.json`. **Import Save** accepts a supported versioned JSON archive and asks before replacing the current local save. Malformed files, unsupported versions and saves over 128 KiB are rejected; fields and positions are whitelisted/clamped. Existing local saves are migrated in memory automatically. The XR laboratory still shares the same saved zone but does not yet render the 2D threshold interactions.

## Immersive world bridge (v0.4)

The **XR Laboratory** now shows **two distinct, numbered 3D threshold gates** per Experience Zone. In a headset, point a controller at the portal opening and press its trigger. Desktop preview offers Left Gate and Right Gate buttons. Portals travel between exactly the same named site pairs as the 2D game, using the same arrival coordinates and `lenz-poc-v1` browser save. Your zone, Case 001 evidence, health, four 2D character positions and recent portal history remain connected.

The XR scene also displays your persistent Case 001 shard count, vault status and recent portal crossings on its webpage. Controller selection uses a ray against the fixed portals, not a blind "next genre" rotation. An aimed gate changes color. No scripted headset camera movement or continuous locomotion.

**Honest scope:** The headset scene is still a **stationary, low-poly 3D laboratory**. It does not yet offer free-roaming VR movement, 3D inventory/combat, physical clue manipulation, shared scene meshes or completed Quest 3 user testing. Progress synchronizes only between the **same browser origin and browser profile**. Use export/import on the 2D page to transfer between a PC and Quest; no cloud sync has been added.

## XR playable objective and comfort teleport (v0.5)

The [XR Laboratory](xr.html) now includes a first **genuine world interaction**. In **Frontier**, point a VR controller at the glowing central terminal and pull its trigger to retrieve the existing **Case 001 access-code report**. The report is saved in the same `flags.report` field used by the 2D campaign and enables the Dead Sector medical archive there. Repeat scans do not duplicate the reward. A desktop **Scan Frontier Terminal** button is available for a browser smoke test.

**VR navigation:** Point your controller down toward the floor inside the marked simulation bounds. A stable cyan marker previews a valid destination; pull the trigger to teleport there. This is a **bounded, instantaneous reference-space repositioning**: no smooth artificial movement or camera rotation. Looking around and walking physically within your real, safe play area remain supported through normal headset tracking. Aim and trigger also selects either 3D gate or the evidence console. Interaction precedence is **gate → console → floor** to avoid accidental navigation while interacting.

**Limitations:** Quest 3 comfort, controller hardware, floor hit accuracy and reference-space offsets still need on-device confirmation. The laboratory is still a modest low-poly 3D demonstration, **not** full open-world VR, physical grabbing, combat or a 3D conversion of all Case 001 quests. There is no collision system; never rely on virtual geometry as a real-world safety boundary. Old saves remain compatible. No cloud services or analytics have been added.

## Dead Sector VR medical archive (v0.6)

The XR Laboratory now supports **two sequential Case 001 objectives in different realities**. In Frontier, scan the cyan evidence console to obtain the access code. Then enter **Dead Sector** and interact with the **red hospital breaker (1)** to restore power. Finally target **medical archive (2)** to recover the medical countercode. The record is exactly the existing `flags.record` clue that lets the player defeat the sentinel in the 2D Underworld. All rewards persist in the same local save and cannot be repeatedly farmed.

In VR, aim a controller ray at a device and trigger it. On desktop, **Restore Hospital Power** and **Read Medical Archive** buttons provide equivalents. Locked interactions explain missing prerequisites. An imported legacy save containing a medical record automatically counts as having the power restored, and completing the medical record in the 2D game restores power for the XR presentation too. The breaker is an extra VR interaction, **not** a new fifth shard or a requirement imposed on the existing 2D route.

**Scope:** Static low-poly 3D rooms, two targeted devices, bounded teleport and portals. There is no active VR monster chase, combat, inventory physics, audio, or full campaign yet. Quest 3 device testing and comfort review are still required.

## Underworld: Sentinel Shield Encounter (v0.7)

The [XR Laboratory](xr.html) now includes the third linked Case 001 gameplay scene. Recover the **Frontier** access code and **Dead Sector** medical countercode, then cross the **Sublevel** gate into **Underworld**. The countercode exposes the Sentinel's three shield conduits.

- **Combat:** Aim your VR controller at three separated, numbered shield targets, disabling them in the ordered sequence **center (2) → left (1) → right (3)**. The current vulnerable node glows gold. Each correct pulse advances one stage; a wrong pulse costs **4 vitals**, without flashing the headset or moving the camera. Pulses have a short input cooldown.
- **Reward:** With all three conduits disabled, the Sentinel is permanently defeated (`enemyDown=true`). Target the exposed stabilizer core to collect the existing `flags.crystal` clue, which powers the last platform in the 2D Fracture zone.
- **Persistence:** The intermediate `sentinelPhase` is saved across reloads. Already defeated Sentinels from older 2D saves are considered complete. The 2D Underworld encounter remains playable as before and marks the VR fight completed if defeated there.
- **Desktop fallback:** The three pulse buttons and Recover Core button let players verify the full sequence without a headset.

**Scope:** This is an aim-based shield combat **encounter prototype**, not a moving enemy, weapon physics, projectile simulation or full VR combat system. There is no forced camera movement, flashes or jumpscares. Quest controller accuracy, comfort and performance must still be verified on real hardware. Save sharing remains local to the same browser/profile; use the portable save export/import to move between devices.

## The Fracture: Three-anchor reality repair (v0.8)

Case 001 now traverses all **four XR Experience Zones**. Recover the stabilizer core after defeating the Underworld Sentinel, then enter **The Fracture** via the Fault Line portal. The core powers three targetable reality anchors, arranged vertically across the fractured environment.

- **Repair the path:** Use a controller ray (or the page's desktop buttons) to activate the anchors in the sequence **left (1) → right (3) → center (2)**. The next valid target glows gold and completed anchors turn green. Skipping the sequence does not advance the repair and cannot cost health.
- **Recover the coordinates:** Once the third anchor is restored, the decoder becomes accessible. Activate it to recover the existing `flags.platform` fourth Case 001 shard. This unlocks the sealed corporate vault back in the **2D Frontier** game.
- **Progress and legacy saves:** The partial stage lives in `fracturePhase`, which persists between browser reloads and zone changes. Old 2D saves with `platform=true` count as all three anchors complete. Recovering the shard through the original 2D platforming challenge also completes the XR repair without losing progress.
- **Comfort and current scope:** The VR scene remains an **aim-based stabilization puzzle**, not headset-controlled platform jumping. It uses bounded teleport, stationary portals, no artificial camera movement or flashing, and preserves all four genre saves. Quest 3 controller targeting and frame performance still need physical playtesting.

**The final corporate vault remains a 2D Frontier objective**, not yet a 3D XR encounter. A future release should make that ending available inside the headset too.

## Architecture

A dependency-free, static HTML/JavaScript prototype. No third-party runtime, account, tracking, remote resources or server requirement. GitHub Actions runs JavaScript syntax and static smoke tests. A separate workflow deploys the static site to GitHub Pages after merging to main and enabling **Settings → Pages → Source: GitHub Actions**.

See [Game Bible](docs/GAME_BIBLE.md) for narrative/mechanics and [Roadmap](docs/ROADMAP.md) for acceptance criteria, remaining work and XR limitations.

## Creative vision

**One persistent world across changing ways of playing.** Experiential Zones may change perspective and genre, but player actions should continue to matter. The first prototype proves transitions and shared saved state, not the finished seamless simulation. Existing Enter the Field projects such as BTM and Domistika are possible later integration candidates, not current dependencies.

**Credits:** Original game concept and name from Shayne. The L.E.N.Z. corporate antagonist emerged through conversation with MichaelWave369. Produced as part of the Enter the Field creative ecosystem.

**License:** [MIT](LICENSE) for the code and documentation provided in this repository. Original art, third-party marks or separately contributed works may need their own explicit licensing in later releases.
