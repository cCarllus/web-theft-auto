# Why

Web Theft Auto currently renders and collides only with the exterior world, ignores GTA San Andreas `enex` placement data, and has no native representation of the 64-area GTA path graph. As a result, checklist items 8 (Interiors / ENEX), 9 (GTA Path Nodes), and 10 (NPC Navigation / Pathfinding) cannot be implemented faithfully on top of the current streaming model.

These three foundations are coupled: interiors require area-aware render/collision streaming and complete interior assets; path nodes require a faithful lazy parser/store for the original `nodes0.dat` through `nodes63.dat`; NPC navigation requires a generic pathfinding and steering layer that consumes that graph without coupling gameplay to RenderWare, React, Three.js, Rapier, or Unity-specific concepts.

# What Changes

- Parse GTA SA textual IPL `enex` sections into renderer-agnostic data while preserving every on-disk field and the full raw flag word.
- Parse DFF 2DFX type 6 enter-exit effects, preserve their native fields/raw bytes, transform geometry-local ENEX through the placed object's transform, and normalize them into the same ENEX collection/pairing/runtime as textual IPL entries.
- Extend resolved map definitions with entry/exit data and introduce explicit active-area semantics instead of spatially offsetting interiors.
- Index render and collision data by GTA area/render level, treating area 13 as part of the exterior world according to existing project semantics.
- Add an interior transition runtime that resolves linked ENEX pairs, enforces access/time/vehicle rules, uses GTA-style rotated XY trigger/vertical tests, resolves teleport spawn/heading through `CEntryExit` semantics, finds a valid collision-safe teleport point, prewarms target render and collision before releasing the player, and suppresses immediate destination re-triggering.
- Make both fetch/build and File System Access asset-selection paths include DFF/TXD assets referenced exclusively by interiors, sharing selection logic through `packages/game-build` instead of maintaining duplicate exterior-only scans.
- Add a complete renderer-agnostic parser for GTA SA `nodes*.dat`, preserving vehicle nodes, pedestrian nodes, navi data, links, link lengths, intersection metadata, filler/trailing bytes, and raw flags.
- Add a lazy 8x8 path-area store over the 64 original GTA path files, with area/radius lookup, caching, cross-area link resolution, and an API shape that can support future eviction.
- Add generic navigation graph/provider interfaces so GTA-specific path-node types do not leak into the game core.
- Add a pure TypeScript A\* pathfinder with deterministic tie-breaking, pedestrian-node filtering, cross-area routing, nearest-node resolution, cancellation, no-route results, and link-length costs.
- Add a reusable NavigationAgent/NpcNavigation layer that follows routes, advances waypoints, respects path width/stopping distance, supports cancellation/replanning, and emits deterministic desired movement/steering without owning character physics.
- Add browser debug inspection for active area/interior, ENEX bounds, nearby pedestrian nodes/links, and requested routes.
- Add synthetic, GTA-fixture, integration, regression, and browser validation covering the three capabilities.

# Capabilities

## New Capabilities

- `interiors-enex`: Parse textual IPL and DFF 2DFX type 6 ENEX, resolve/normalize them into one runtime, stream and transition into/out of GTA SA interiors using explicit active-area state, including complete interior assets plus render/collision readiness.
- `gta-path-nodes`: Parse and lazily expose the original GTA SA `nodes0.dat` through `nodes63.dat` path graph with all pedestrian, vehicle, navigation, link, and intersection metadata preserved.
- `npc-navigation`: Plan deterministic A\* routes over a generic navigation graph and provide reusable waypoint/steering infrastructure for later pedestrian AI, without implementing pedestrian population or full Ped AI in this change.

## Modified Capabilities

None. The project currently has no durable OpenSpec capability specifications to amend.

# Impact

- **RenderWare/map data:** textual IPL ENEX parsing, DFF 2DFX type 6 parsing/normalization, resolved map definitions, area-aware world indexing, collision-cell binding, and a new path-node binary parser.
- **Asset pipeline:** shared placed-model discovery in `packages/game-build`, consumed by both `scripts/build-game.ts` and the local File System Access loader.
- **Game runtime:** area state, interior transition orchestration, render/collision streaming area keys, generic navigation graph/pathfinder/agent interfaces, and GTA adapter implementations.
- **Web app/debug:** runtime wiring in the existing bootstrap and non-essential debug visualisation/actions.
- **Tests/fixtures:** an optional real `tests/original/path/nodes15.dat` fixture generated from a clean local GTA SA install, textual and DFF 2DFX ENEX fixtures/tests, exact trigger/teleport tests, and integration/regression coverage.
- **Compatibility:** existing native/Docker asset flows remain unchanged in ownership; GTA assets stay local/gitignored. Existing `CharacterControllerSystem.runPath()` and `EnterVehicleSystem` remain supported and are regression-tested.

# Dependency Order

1. ENEX parsing and interior-inclusive asset selection establish complete world data.
2. Area-indexed render/collision streaming establishes the runtime boundary required for safe ENEX transitions.
3. GTA path-node parsing and lazy area storage establish the navigation graph.
4. Generic A\* pathfinding consumes the graph.
5. NavigationAgent consumes pathfinder results and exposes reusable movement intent for future pedestrian systems.

The change intentionally stops before pedestrian population, full Ped AI state machines, traffic simulation, mission/shop/economy behavior, and Unity-style NavMesh generation.
