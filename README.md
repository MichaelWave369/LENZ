# LENZ
### ONE WORLD. INFINITE PERSPECTIVES.

**LENZ** is an original, open-source, genre-shifting adventure prototype. Shayne imagined a game that could move between shooters, horror, platformers, open-world exploration and isometric dungeon combat, with a new experience at every turn. He named it **LENZ**. The game's fiction revolves around **L.E.N.Z.**, the *Laboratory for Experiential Neurorealities and Zoning*, a corporation whose simulated realities have begun merging.

> “Reality is what we make it.” — L.E.N.Z. Corporation

## Play the prototype

Once GitHub Pages is enabled, the project's site should be available at:

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

## Architecture

A dependency-free, static HTML/JavaScript prototype. No third-party runtime, account, tracking, remote resources or server requirement. GitHub Actions runs JavaScript syntax and static smoke tests. A separate workflow deploys the static site to GitHub Pages after merging to main and enabling **Settings → Pages → Source: GitHub Actions**.

See [Game Bible](docs/GAME_BIBLE.md) for narrative/mechanics and [Roadmap](docs/ROADMAP.md) for acceptance criteria, remaining work and XR limitations.

## Creative vision

**One persistent world across changing ways of playing.** Experiential Zones may change perspective and genre, but player actions should continue to matter. The first prototype proves transitions and shared saved state, not the finished seamless simulation. Existing Enter the Field projects such as BTM and Domistika are possible later integration candidates, not current dependencies.

**Credits:** Original game concept and name from Shayne. The L.E.N.Z. corporate antagonist emerged through conversation with MichaelWave369. Produced as part of the Enter the Field creative ecosystem.

**License:** [MIT](LICENSE) for the code and documentation provided in this repository. Original art, third-party marks or separately contributed works may need their own explicit licensing in later releases.
