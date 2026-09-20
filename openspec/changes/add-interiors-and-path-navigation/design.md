# Context

Web Theft Auto already has mature exterior world streaming, collision streaming, local/fetch asset pipelines, a GTA-specific world adapter, and a generic game core. The missing pieces for checklist items 8, 9, and 10 are not isolated features: interiors require a world partition that understands GTA render areas; GTA path nodes require a faithful binary graph representation; NPC navigation requires a generic consumer of that graph that does not become entangled with rendering or physics implementation details.

The current repository confirms the following constraints:

- `parseIpl()` handles only the textual IPL `inst` section. `enex` is ignored.
- `interiorId()` already extracts the low byte of the placement area value, and `isInterior()` already treats area 13 as open-world data rather than a hidden interior.
- `buildWorldGrid()` currently drops hidden-interior placements entirely.
- `StreamingSystem` and `CollisionStreamingSystem` key cells only by X/Y (plus HD/LOD for render) and do not consume active-area state.
- `scripts/build-game.ts` and the File System Access local loader both exclude text IPLs under `data/.../interior/...` when discovering placed model IDs, so interior-only DFF/TXD assets are currently absent from the selected VFS payload.
- The two asset pipelines already share `packages/game-build/src/partition.ts`, making that package the correct place to centralize interior-inclusive placement/reference discovery.
- `partitionEntries()` already copies `.dat` entries from `gta3.img` into the `others` group. Therefore `nodes0.dat` through `nodes63.dat` already reach the VFS and do not need a second asset pipeline.
- `WorldAdapter` is already broad. Adding all entry/exit and path graph operations directly to it would make it harder to keep generic consumers independent from GTA/RenderWare concerns.
- `CharacterControllerSystem.runPath()` is a small scripted locomotion helper used by `EnterVehicleSystem` for a short local door approach. It is not a graph pathfinder and should remain intact.
- `apps/web/src/ui/canvas-host.tsx` is the current composition root and debug-action bridge, so it is the appropriate integration location without placing browser/UI dependencies in the new core systems.
- Real GTA fixtures are regenerated locally under `tests/original/`; `int_cont.ipl` already exists in that workflow and `scripts/test-fixtures.ts` can extract a real `nodes15.dat` without committing Rockstar assets.

Reference implementations are used only to establish file formats, rules, flow, and behavioral expectations:

- SanAndreasUnity `dev`: `EntranceExit.cs`, `EntranceExitMapObject.cs`, `Cell.cs`, `AreaChangeDetector.cs`, `NodeFile.cs`, `PathfindingManager.cs`, `PedAI.cs`, `PathMovementData.cs`, `WalkAroundState.cs`, `EscapeState.cs`, `FollowState.cs`.
- gta-reversed: `FileLoader.cpp`, `EntryExit.cpp`, `EntryExitManager.cpp/.h`, `PathFind.cpp/.h`.
- GTA technical documentation for textual IPL ENEX layout and San Andreas path-file layout.

Unity-specific concepts are not part of this design.

# Goals

- Support faithful GTA SA ENEX parsing and runtime transitions between exterior and hidden interiors.
- Include all DFF/TXD assets required only by interiors in both VFS construction paths.
- Model the active GTA area explicitly and make render/collision streaming area-aware.
- Guarantee target interior collision is ready before player control is released after a transition.
- Parse all relevant data in `nodes0.dat` through `nodes63.dat` without losing unknown/raw metadata.
- Lazily load path areas by the original 8x8 spatial division instead of parsing the entire graph at boot.
- Expose a GTA-independent navigation graph interface to the game core.
- Provide deterministic A\* path planning with cancellation/replan-friendly APIs.
- Provide reusable waypoint following and basic steering/avoidance intent for future pedestrian AI.
- Preserve current exterior streaming behavior, `CharacterControllerSystem`, and `EnterVehicleSystem.runPath()`.
- Provide enough debug visibility to inspect area state, ENEX, path nodes, links, and routes in-browser.

# Non-Goals

This change does not implement:

- shops, purchases, restaurants, barber, tattoo, gym, or economy;
- mission scripting or SCM mission gating beyond an entry/exit enable/disable API;
- burglary gameplay;
- interior pedestrian population;
- pedestrian population (master checklist item 14);
- full Ped AI state machines (master checklist item 15);
- traffic simulation or vehicle route-following, despite preserving vehicle path metadata now;
- dynamic GTA interior path construction beyond the original 64 map `nodes*.dat` areas;
- a global NavMesh;
- Unity `MonoBehaviour`, `GameObject`, `NavMesh`, `NavMeshAgent`, `NavMeshGenerator`, physics, editor, prefab, scene, or `.meta` concepts;
- vertical coordinate offsets such as SanAndreasUnity's interior-height separation trick;
- pathfinding every frame for every NPC.

# Decisions

## 1. Keep low-level GTA parsing in renderware and runtime policy in game

`packages/renderware` remains the owner of renderer-agnostic GTA file parsing and raw map/path data. It may know GTA binary/text formats but must not import Three.js, Rapier, React, browser APIs, or game AI.

`packages/game` owns runtime state machines, generic navigation interfaces, pathfinding, and agent behavior. Generic game code must not import RenderWare parser types.

`GtaSaWorldAdapter` and small GTA-specific providers translate between raw GTA structures and generic game interfaces.

This preserves the repository's existing split: raw GTA knowledge at the adapter/data edge, gameplay orchestration in the game package.

## 2. Extend IPL parsing without breaking callers that only need instances

The existing `parseIpl(text): IplInstance[]` behavior is widely useful and should remain source-compatible.

Add a richer renderer-agnostic textual IPL parse result, for example an API equivalent to:

- `parseIplSections(text) -> { instances, entryExits }`, or
- a dedicated `parseEnex(text)` alongside the existing instance parser.

`resolveMap()` consumes the richer result and exposes all resolved ENEX entries in `MapDefinitions`.

The precise function name is implementation detail; the required behavior is:

- existing instance-only callers continue to work;
- `resolveMap()` obtains both `inst` and `enex`;
- source ordering of ENEX entries is retained because GTA pair resolution is order-sensitive.

## 3. Preserve the complete ENEX record and raw flags

A renderer-agnostic ENEX type stores every textual field:

- entrance position X/Y/Z;
- entrance heading/angle;
- entrance extent/radius X/Y/Z;
- exit position X/Y/Z;
- exit heading/angle;
- target area/interior;
- 16-bit flags;
- name;
- sky color;
- number of peds to spawn;
- time on;
- time off.

The parser MUST preserve the raw flag word even when a flag has no behavior in this phase.

The canonical named flag mapping follows gta-reversed's `CEntryExit::eFlags` for the 16 bits, while keeping raw bits authoritative:

- bit 0: unknown/interior metadata;
- bit 1: pairing/unknown runtime semantic;
- bit 2: create linked pair;
- bit 3: reward interior;
- bit 4: used reward entrance;
- bit 5: cars and aircraft;
- bit 6: bikes and motorcycles;
- bit 7: disable on foot;
- bit 8: accept NPC group;
- bit 9: food/date-related runtime semantic;
- bit 10: burglary-related metadata;
- bit 11: disable exit;
- bit 12: burglary access;
- bit 13: entered without exit;
- bit 14: enable access;
- bit 15: delete ENEX.

Documentation disagreements around historically reverse-engineered names do not justify discarding bits. The raw flag word survives round-trip parsing and unsupported flags remain available as metadata.

## 4. Separate static ENEX flags from mutable runtime access

The on-disk flag word is immutable source metadata. Runtime access is modeled separately.

Each normalized entry/exit has runtime availability state initialized according to normal GTA entry availability, not simply by testing whether raw bit 14 happened to be present in the IPL row. A small future-facing API can enable/disable an ENEX by stable ID for later mission logic.

This avoids the incorrect interpretation that an entry lacking the runtime `ENABLE_ACCESS` bit in raw text must be inaccessible forever.

The transition eligibility check in this phase implements:

- runtime access enabled;
- active source area compatibility;
- `timeOn/timeOff`, including ranges that wrap midnight;
- disable-on-foot;
- cars/aircraft;
- bikes/motorcycles;
- disable-exit in the exit direction;
- deleted/disabled entries excluded.

Other flags are preserved and exposed but do not gain speculative gameplay behavior.

## 5. Model GTA area explicitly; never move interiors vertically

Introduce an explicit active-area model.

A normalized runtime area identifier is a small generic scalar/value type in `packages/game`; GTA-specific code maps the low byte of IPL area/render-level values onto it.

For GTA SA:

- low-byte area 0 is exterior/open world;
- area 13 is also part of the exterior world scene, as already established by `interior.ts`;
- hidden interior areas are distinct active areas;
- high bits in placement area codes do not change the low-byte render level.

Area compatibility rules are explicit:

- while the active world is exterior, placement groups for GTA areas 0 and 13 are eligible;
- while a hidden interior area N is active, only the hidden-interior group compatible with N is eligible;
- hidden interior groups are never rendered merely because their X/Y coordinates fall near the player;
- area 13 does not leak into hidden interiors.

No `+5000` Z offset, alternate-coordinate-world hack, or duplicated scene is used.

## 6. Replace exterior-only grid filtering with area-indexed world data

The current world grid drops hidden interiors. Evolve it into area-indexed data while preserving the existing X/Y cell partition and HD/LOD behavior.

Conceptually:

`AreaWorldIndex -> AreaGroup -> WorldGrid(cellKey -> GridCell)`

The exterior group contains placements whose low-byte area is 0 or 13. Each hidden-interior group contains placements for its own area.

Important properties:

- no requirement to construct/render all area meshes at once;
- grid construction is data-only and renderer-agnostic;
- the existing cell size remains valid;
- render and collision loaders receive an area/group in their request/cache key;
- changing active area invalidates the set of desired runtime keys, not the immutable map definitions;
- existing exterior LOD/hysteresis behavior remains unchanged inside the exterior group.

## 7. Use separate providers instead of expanding WorldAdapter indefinitely

Do not make `WorldAdapter` the API for every new subsystem.

Introduce small interfaces in the generic game package, with names equivalent to:

- `AreaProvider` / `ActiveAreaStore`: reads and changes active runtime area.
- `EntryExitProvider`: returns normalized entry/exit descriptors relevant to an area and exposes runtime access overrides.
- `AreaStreamProvider`: can prepare/check render and collision readiness for an area near a position.
- `NavigationGraphProvider`: exposes generic nodes, neighbors, costs, widths, and search candidates.

The GTA adapter may implement these directly or compose dedicated GTA provider objects, but consumers depend only on the narrow interface they need.

`WorldAdapter` keeps its existing responsibilities and only receives the minimum area dimension necessary for cell loading if that is the least disruptive integration.

## 8. Resolve ENEX links once and assign stable IDs

ENEX entries receive stable IDs derived from resolved source order (and, where useful, source IPL identity) so debug tools, tests, runtime access overrides, and suppression state can refer to a specific entry even when names repeat.

Pairing is a preprocessing step over the ordered resolved ENEX list.

Rules:

1. `CREATE_LINKED_PAIR` and GTA entry/exit manager semantics determine which records require/participate in pairing.
2. Name equality may be used as a candidate key because GTA data uses names to associate related entries, but name equality alone MUST NOT decide the pair.
3. Candidate selection also respects source/load order, one-to-one link assignment, area/direction compatibility, and relevant pairing flags.
4. Duplicate-name groups are deterministic.
5. A successfully paired entry stores an explicit link to its counterpart.
6. Unlinked/one-way entries remain representable.
7. Pairing behavior is locked down with real and synthetic fixtures, especially duplicate-name cases.

Implementation work should compare the final resolver against gta-reversed `CEntryExitManager` behavior rather than copy SanAndreasUnity's simple "same name" heuristic.

## 9. Interior transitions use an explicit state machine

Create an `InteriorTransitionSystem` (or equivalently scoped system) that does not live inside `CharacterControllerSystem`.

State model:

1. **Idle**
   - inspect ENEX candidates in the active area near the player;
   - choose only a containing/eligible entry.

2. **PreparingTarget**
   - resolve linked target/direction and target area;
   - suspend transition re-entry and player-controlled locomotion;
   - ask area streaming/collision services to prepare the destination neighborhood.

3. **Committing**
   - once required destination collision is confirmed available, switch active area;
   - remove or hide incompatible source-area render content;
   - replace incompatible source-area collision;
   - place the player at the GTA-resolved destination/exit position;
   - apply destination heading;
   - synchronize camera/follow state as needed without re-owning camera logic.

4. **Suppressed**
   - remember the destination trigger/pair;
   - do not allow that destination volume to immediately trigger the reverse transition;
   - remain suppressed until the player has left the destination ENEX volume (a tiny minimum time/frame guard may supplement this but cannot replace volume exit).

5. **Idle**
   - normal detection resumes after suppression releases.

This handles exterior -> interior, interior -> exterior, and interior -> interior using the same mechanism.

A transition is atomic from the player's perspective. If target preparation fails or is cancelled, the runtime keeps/restores the source area and source player state instead of leaving the player in an unloaded interior.

## 10. Destination collision readiness is a first-class contract

The current collision streamer is intentionally asynchronous and eventually loads nearby cells. That is insufficient for teleport transitions.

Add a readiness/prewarm operation on the narrow area streaming/collision abstraction that can:

- request the target area's collision around a target position;
- resolve when the required target cell(s) are created in the physics world;
- reject/cancel on load failure;
- distinguish stale requests when another transition supersedes the current one.

The transition system MUST NOT release the player's physics/controller at the destination before this promise/handle reports readiness.

Normal exterior movement continues to use background collision streaming exactly as today.

## 11. Make interior asset selection a shared game-build operation

The current build and local-loader paths each implement exterior-only placement scanning. Replace that duplication with shared selection logic in `packages/game-build`.

The shared logic must discover placed IDs from:

- relevant loose textual IPLs, including `data/maps/interior/**`;
- binary IPL streams in IMG archives;
- existing configured placement groups where applicable.

It then resolves the union of exterior and interior placement IDs through IDE definitions before calling existing `partitionEntries()`.

Both:

- `scripts/build-game.ts` (fetch/build archives), and
- `packages/loaders/src/asset-local-loader/build-vfs.ts` (File System Access)

consume the same shared placement/reference rules.

This change only expands which DFF/TXD entries are selected. It does not mean those interior assets are rendered until their area is active.

Regression tests compare equivalent synthetic input through both paths so future selection changes cannot silently diverge.

## 12. Parse the GTA path file byte-for-byte before interpreting it

Add a binary path parser under `packages/renderware`, with no renderer/runtime dependencies.

The parser supports `nodes0.dat` through `nodes63.dat` and reads little-endian data in the original order.

Header (20 bytes):

1. total node count (`uint32`);
2. vehicle node count (`uint32`);
3. pedestrian node count (`uint32`);
4. navi/car-path-link count (`uint32`);
5. node-link/address count (`uint32`).

The parser validates that count arithmetic and required section sizes fit in the buffer before allocating large arrays.

### Path nodes

Each path node is 28 bytes and preserves:

- two original 32-bit pointer/unused fields as raw values;
- compressed X/Y/Z signed 16-bit coordinates, decoded with GTA's fixed-point scale;
- 16-bit search/heuristic/runtime field as raw value;
- base link index;
- area ID;
- node ID;
- raw path-width byte;
- flood-fill byte;
- raw 32-bit flags.

The file orders vehicle nodes first, then pedestrian nodes according to header counts. The parser exposes that distinction without duplicating node records.

For width, preserve the byte and expose both unambiguous interpretations needed by consumers:

- full corridor width = raw / 8;
- half-width/lateral radius = raw / 16.

This reconciles technical documentation describing the full width with gta-reversed's fixed-point `m_nPathWidth / 16` use for per-side offsets.

### Path-node flags

Preserve the raw word and expose validated on-disk fields, including at least:

- link count (low 4 bits);
- traffic-level/on-disk traffic bits;
- road-block metadata;
- water/boat node;
- emergency-only / don't-wander-related metadata where represented by the file;
- not-highway/highway;
- spawn probability;
- behavior type, including parking/roadblock semantics.

Do not copy runtime-mutated bitfield names from `CPathNode` blindly where the on-disk interpretation differs. Raw flags remain available to future traffic work.

### Navi nodes / car path links

Each 14-byte navi node follows the GTA `CCarPathLink` layout and preserves:

- compressed 2D position;
- attached path-node address;
- compressed direction vector;
- raw width byte;
- opposite-direction lane count;
- same-direction lane count;
- traffic-light direction;
- traffic-light state/behavior bits;
- bridge/train-crossing-related bit(s);
- unused/raw bits.

The parser exposes both raw packed bytes and decoded values.

### Node links

Each normal node link is a 4-byte `PathNodeId` / `CNodeAddress` containing target area and target node.

The node's base-link index plus decoded link-count selects its contiguous links.

### Filler

After normal node links, San Andreas stores dynamic-link reserve space equivalent to `NUM_DYNAMIC_LINKS_PER_AREA * 12` node addresses. With 16 dynamic links per area this is 192 addresses = 768 bytes.

The parser advances over and preserves this region rather than pretending it is normal graph data.

### Navi links

Each navi link is a packed 16-bit address:

- 10-bit navi node index;
- 6-bit area ID.

### Link lengths

One byte per normal plus dynamic-reserve link slot. Normal graph edges expose the corresponding link length as their authored cost.

### Intersection flags

One byte per normal plus dynamic-reserve link slot. Expose at least:

- road-crossing flag;
- pedestrian-traffic-light flag;
- remaining bits raw.

### Trailing/unknown bytes

Any validated trailing bytes not consumed by known fields are retained on the parsed `NodeFile/PathArea` result. A parser must not silently ignore a shortened or unexpectedly extended layout.

## 13. Keep path-node types renderer-agnostic and future-traffic-safe

`packages/renderware` defines data types equivalent to:

- `PathNodeId`;
- `PathNode`;
- `PathNodeFlags`;
- node kind (vehicle/pedestrian);
- `NodeLink`;
- `NaviNode`;
- `NaviNodeLink`;
- `PathIntersectionFlags`;
- `NodeFile` / `PathArea`.

Vehicle nodes and navi metadata are parsed and retained even though the first consumer in this change uses pedestrian nodes.

This prevents a later traffic-system change from requiring a second incompatible parser.

## 14. Use the original 8x8 path regions as the first spatial index

The outdoor GTA SA path map is divided into:

- 8 columns x 8 rows;
- 64 areas;
- 750 x 750 world units per area;
- southwest origin at approximately (-3000, -3000);
- row-major area ID.

A GTA path-area provider maps position/radius to only the touching area IDs and requests those files.

The provider does not scan every loaded node globally for ordinary nearest-node queries.

Boundary queries include adjacent path areas when the search radius crosses an area edge.

Cross-area node links retain the target area/node ID and are resolved by the store/provider when the target is needed.

## 15. PathAreaStore owns lazy loading and cache policy boundaries

A GTA-specific `PathAreaStore` sits at the VFS/RenderWare boundary.

Responsibilities:

- map area ID 0..63 to `nodes{area}.dat`;
- load a file only when requested;
- cache an in-flight promise so concurrent requests do not parse the same area twice;
- cache the parsed immutable area after success;
- expose `areasNear(position, radius)`;
- expose `getArea(id)` / `ensureAreas(ids)`;
- resolve cross-area links through stable IDs;
- surface missing/malformed area errors predictably;
- expose cache metadata/hooks so a future eviction policy can be added without changing the parser or generic pathfinder.

Default behavior in this change may retain successfully parsed areas for the session. The API must not require permanent retention.

It does not parse all 64 files during game boot.

## 16. Translate GTA path data into a generic NavigationGraphProvider

Generic game navigation sees normalized concepts only:

- stable navigation node ID;
- position;
- pedestrian/vehicle usability metadata needed by a filter;
- corridor/path width;
- neighbors;
- edge cost;
- optional intersection/semantic metadata.

The GTA provider translates `PathNodeId`, flags, and lazy area storage to these concepts.

The core A\* implementation must not import `@opensa/renderware`, VFS types, Three.js, Rapier, React, or DOM APIs.

## 17. Nearest-node queries are spatial and filter-aware

Nearest-node lookup:

1. determines only path areas touching the query radius;
2. ensures those areas are loaded;
3. visits only the requested node kind (pedestrian by default for NPC navigation);
4. applies the caller's node filter;
5. computes squared geometric distance;
6. resolves ties deterministically by canonical node ID.

Default pedestrian routing excludes nodes that are not valid for ordinary ambient pedestrians, including emergency-only/no-wander semantics where confirmed by GTA flags.

Vehicle/water/highway/parking/spawn/traffic metadata remains available for later traffic work.

If no acceptable node is inside the requested radius, the query returns an explicit not-found result rather than silently selecting an arbitrarily distant node.

## 18. Separate path planning from frame-by-frame navigation

Two layers are mandatory.

### Path planning

Question: "Which graph route connects A to B?"

Responsibilities:

- nearest source pedestrian node;
- nearest destination pedestrian node;
- graph expansion;
- edge cost;
- A\* open/closed sets;
- parent reconstruction;
- filters;
- cancellation;
- deterministic result.

### Navigation / steering

Question: "How should this agent move toward the current route this frame?"

Responsibilities:

- current route/waypoint;
- path-width-aware target point;
- waypoint arrival/advance;
- stopping distance;
- route validity;
- progress/stall observation;
- explicit cancel/replan;
- desired movement direction;
- basic avoidance intent.

This separation prevents future WalkAround/Escape/Chase/Follow logic from embedding graph search inside per-frame movement code.

## 19. A\* uses authored link lengths with a safe geometric heuristic

The A\* core is pure TypeScript and operates on the generic graph.

Edge cost:

- use the GTA authored link-length byte when it is valid and positive;
- otherwise fall back to geometric distance between the connected nodes;
- never use an invalid/non-finite/negative cost.

Heuristic:

- start from straight-line geometric distance to the destination;
- preserve optimality when authored byte costs can under-represent geometry by applying a conservative scale derived from usable edge cost/geometric-distance ratios, or degrade the heuristic to zero for a query when admissibility cannot be guaranteed;
- a zero heuristic is acceptable because it becomes Dijkstra behavior while remaining correct.

This explicitly avoids returning a non-minimal authored-cost path merely to make A\* look faster in a benchmark.

Open-set ordering is deterministic:

1. lowest `f`;
2. then lowest `h` or `g` according to one documented fixed rule;
3. then canonical node ID / stable insertion order.

Parent reconstruction returns source-to-destination order.

Disconnected graphs return `no-path`, not a partial route disguised as success.

## 20. Make the path query API asynchronous and cancellation-friendly

Area loading is asynchronous even if parsing itself is synchronous.

Expose an asynchronous service boundary equivalent to:

`findPath(request, AbortSignal?) -> Promise<PathResult>`

with a discriminated result such as:

- `found`;
- `no-path`;
- `cancelled`;
- `invalid-source`;
- `invalid-destination`.

The pure search kernel accepts serializable graph/query data and has no runtime object dependencies. This keeps a future Web Worker migration viable without redesigning the public request/result model.

Cancellation is checked during area preparation and periodically during graph expansion. A cancelled query must not commit a stale result into a NavigationAgent.

## 21. NavigationAgent owns route state, not physics

A generic `NavigationAgent` / `NpcNavigation` class/state machine receives:

- current position;
- destination;
- a path-query service;
- navigation parameters;
- optional obstacle/steering information through a small interface.

It owns:

- request generation;
- route generation/version ID;
- current waypoint index;
- current route status;
- previous/next waypoint;
- stopping distance;
- replan/cancel state;
- progress/stall timing;
- deterministic lateral route offset/seed if configured.

It outputs a movement intent such as normalized desired planar direction, target point, desired speed factor, and arrived/blocked state.

It does not call Rapier, mutate ECS velocity directly, animate a pedestrian, or spawn an NPC.

A later Ped locomotion/AI system consumes the movement intent and applies it through the existing physics conventions.

## 22. Path width is used to avoid centerline marching

For ambient/wandering-compatible routes, a waypoint may be converted to a deterministic point inside the path corridor rather than always using the exact node center.

Rules:

- derive the usable lateral radius from the parsed path width;
- choose an offset using a deterministic seed/state, not `Math.random()` on every frame;
- keep the offset inside the authored corridor;
- preserve waypoint ordering;
- do not jitter the target while the same waypoint remains active.

This reproduces the useful GTA/SanAndreasUnity behavior where pedestrians do not all walk an identical mathematical centerline.

## 23. Provide a reusable wandering primitive without implementing Ped AI

This change may provide a helper/state-independent operation for future ambient walking:

1. find a nearby acceptable pedestrian node;
2. prefer normal/non-emergency nodes;
3. when a node is reached, inspect linked pedestrian nodes;
4. if alternatives exist, avoid immediately selecting the previous node;
5. deterministically choose among eligible links;
6. choose a point within the next corridor width.

It does not spawn peds or add WalkAround/Escape/Chase/Follow AI states.

Future AI states consume the same path-query and NavigationAgent abstractions.

## 24. Basic avoidance uses a narrow physics-independent query interface

Navigation requires basic steering/avoidance compatibility with the existing physics without importing Rapier into the core agent.

Define a small query/result boundary, for example:

- forward obstacle probe;
- optional left/right clearance;
- dynamic avoidance vector supplied by the runtime.

The agent blends route direction with a bounded avoidance correction and retains the original route.

If progress remains below a threshold for a configured duration, the agent reports blocked and can request a throttled replan.

No expensive A\* query runs every frame.

## 25. Replanning is explicit, throttled, and stale-safe

A NavigationAgent replans only when one of these conditions occurs:

- destination changes materially;
- current route becomes invalid;
- an explicit consumer requests replan;
- progress is blocked beyond a configured threshold;
- a graph/provider generation indicates relevant invalidation.

The agent:

- cancels/supersedes any older query;
- observes a minimum replan interval;
- applies only the result matching its current request generation;
- preserves movement state predictably while a replan is pending.

This is required for scaling to pedestrian populations later.

## 26. Keep EnterVehicleSystem's local runPath behavior independent

`CharacterControllerSystem.runPath()` continues to support the current short scripted player path used to approach a vehicle door.

This change does not replace that flow with the GTA node graph.

Regression tests ensure:

- a run-to-door path still advances and reports arrival;
- cancelling it still returns to manual control;
- entry/exit behavior is unchanged by adding navigation infrastructure.

Graph pathfinding may be consumed by future scripted player behavior, but not as a prerequisite for vehicle entry in this change.

## 27. Browser debug tooling is observational, not functional

Extend existing debug infrastructure so developers can inspect:

- current active area/interior;
- nearby ENEX volumes and IDs;
- source/target pair relation;
- runtime ENEX eligibility/suppression state;
- nearby pedestrian path nodes;
- node area/id and relevant flags;
- links and cross-area targets;
- a manually requested start/destination debug route;
- route cost/status and polyline.

Debug drawing may use Three.js/app-layer facilities, but production parsing/pathfinding/interior transitions cannot depend on the debug UI being mounted.

Debug data is obtained through provider/system inspection APIs rather than reaching into private parser objects.

# Data Flow

## Interior data and assets

1. GTA install / packed VFS provides `gta.dat`, IDEs, text IPLs, binary IPLs, IMG entries, and collision.
2. Shared build selection scans placements including interior textual IPLs and resolves all referenced DFF/TXD names.
3. Fetch build or File System Access loader materializes the same selected asset set into the VFS.
4. `resolveMap()` parses IDE definitions, placement instances, and ENEX data.
5. Area indexing groups placements into exterior (0 + 13) or hidden area N.
6. GTA adapter exposes area-keyed render/collision loaders plus normalized ENEX descriptors.
7. `InteriorTransitionSystem` detects an eligible source ENEX.
8. Target render/collision is prepared.
9. Active area, collision set, player transform, and heading are committed.
10. Destination trigger remains suppressed until exited.

## Path data

1. Existing asset partition places `nodes*.dat` from `gta3.img` into the VFS `others` data.
2. `PathAreaStore` maps world position/radius to one or more area IDs.
3. Requested `nodes{area}.dat` is loaded from the VFS and parsed once.
4. GTA navigation provider translates parsed pedestrian nodes/links into generic graph records.
5. Cross-area expansion asks the store for linked areas only when needed.
6. Nearest-node and A\* operate on the generic provider.
7. NavigationAgent consumes the returned route and produces movement intent.

# Failure Handling

## ENEX/parser failures

- Malformed ENEX rows are rejected/skipped according to parser conventions without manufacturing default positions.
- Invalid numeric fields do not produce non-finite runtime transforms.
- Quoted names containing spaces remain intact.
- Unknown flag bits are preserved.
- A malformed/unresolvable pair is diagnosable and does not crash map resolution.
- A transition with no valid target does not teleport.

## Interior load failures

- Failure to prepare target collision aborts the transition before destination control is released.
- A stale preparation result cannot commit after a newer transition request supersedes it.
- Source-area state remains/restores coherently after failure.
- Render/collision cache keys contain area identity so same X/Y cell coordinates from different areas cannot alias.

## Path parser failures

- Header counts are range/size checked before allocation.
- Truncated buffers throw/return a structured parse failure rather than reading beyond the buffer.
- Invalid link ranges are rejected or surfaced as invalid records according to one documented parser policy.
- Unknown/trailing data is preserved rather than silently normalized away.
- The parser does not trust area/node references to be locally resolvable; cross-area references are valid.

## Graph/path failures

- Missing VFS path area surfaces as provider failure/not-ready, not an infinite search.
- No nearest valid source/destination produces an explicit result.
- Disconnected graphs produce `no-path`.
- AbortSignal cancellation produces `cancelled` and cannot update an agent with a stale route.
- A malformed edge cost falls back to geometry; if no safe cost is possible, the edge is excluded and diagnosed.

# Performance

- Do not load or render every interior. Area state filters runtime render/collision streaming.
- Do not build a global NavMesh.
- Do not parse all 64 `nodes*.dat` files at boot.
- Use the native 8x8/750-unit path area partition as the first spatial index.
- Cache parsed path areas and in-flight parse promises.
- Nearest-node queries inspect only relevant area(s), not all world nodes.
- A\* stores compact IDs/costs and reuses data structures where profiling justifies it; avoid object churn in the inner expansion loop.
- Pathfinding occurs on destination/replan events, never once per frame.
- Agent steering runs per frame but does not allocate a new graph/path query per frame.
- Replan is throttled and cancelled/superseded safely.
- Search request/result structures remain serializable so heavy route computation can move to a Web Worker later.
- Area render/collision caches include area identity and continue to leverage current cell caching/hysteresis.

# Risks / Trade-offs

## ENEX reverse-engineering ambiguity

Some community documentation assigns different descriptive names to a few ENEX bits. The mitigation is to preserve the raw 16-bit word, use gta-reversed as the primary behavior reference, implement only flags required by this phase, and avoid inventing gameplay for ambiguous bits.

## Area 13 special case

Treating every nonzero low byte as an interior would regress the existing world because area 13 contains open-world placements. The area grouping must retain the repository's already-tested special handling: 0 + 13 are the exterior world scene.

## Larger VFS selection

Including interior-only DFF/TXD increases archive/VFS size. This is intentional and necessary for functional interiors. Selection remains reference-driven rather than copying every IMG model/texture.

## Cross-area A\* can trigger additional lazy loads

A route crossing path-area boundaries may require more path files than the start/destination areas. The store deduplicates loads, cancellation prevents wasted stale results, and a future cache eviction policy can constrain retention.

## Authored link length is quantized

The one-byte GTA link cost may not perfectly match geometric distance. The pathfinder treats it as authoritative when valid but makes the heuristic conservative if necessary to preserve shortest-cost correctness.

## Basic steering is not full crowd avoidance

The first NavigationAgent provides deterministic route following and simple obstacle correction. It deliberately does not promise reciprocal velocity obstacles, crowd simulation, or NavMesh-quality local planning. Those can be layered later without replacing A\* or the GTA graph.

# Migration Plan

1. Add parser/tests and shared data types without changing runtime behavior.
2. Change asset selection to include interior placement references in both pipelines and prove parity.
3. Introduce area-indexed world data while keeping exterior active by default.
4. Make render streaming area-aware; verify existing exterior streaming behavior first.
5. Make collision streaming area-aware and add destination readiness/prewarm.
6. Add ENEX pair resolution and transition state machine behind the new providers.
7. Add path-node parser and real `nodes15.dat` fixture generation.
8. Add lazy PathAreaStore and GTA graph provider.
9. Add generic nearest-node/A\* pathfinding.
10. Add NavigationAgent and basic avoidance.
11. Wire debug visualisation through the current web bootstrap/debug layer.
12. Run full unit/integration/GTA-fixture/browser validation before marking checklist items complete.

Default active area remains exterior throughout migration so partial intermediate work does not make hidden interiors appear in the normal world.

# Rejected Alternatives

## Unity NavMesh / NavMeshAgent

Rejected. GTA already ships a structured pedestrian/vehicle path graph, and the project needs the original path semantics and metadata for future traffic/Ped AI. A generated Unity-style/global NavMesh would discard those semantics, add an unnecessary build step, and couple navigation to a foreign runtime model.

## Porting SanAndreasUnity architecture

Rejected. SanAndreasUnity is a behavioral/reference source only. MonoBehaviour, GameObject/component lifetime, Unity physics, scenes, prefabs, editor tooling, and NavMeshGenerator do not map to Web Theft Auto's TypeScript/VFS/system architecture.

## Interior height offset

Rejected. Moving interiors by +5000 or another Z offset hides the real problem instead of modeling GTA areas. It breaks authored coordinates, collision/debugging semantics, and makes faithful entry/exit behavior harder.

## Pair ENEX records by name only

Rejected. GTA data contains repeated names and explicit linked-pair semantics. Name can narrow candidates but cannot uniquely define the relationship.

## Put pathfinding in CharacterControllerSystem

Rejected. CharacterControllerSystem is player locomotion/physics and already has a small local `runPath()` API. Graph search, AI route state, and replanning are separate responsibilities.

## Add every new API to WorldAdapter

Rejected. It would make a generic adapter carry unrelated interior/pathfinding policy. Small providers keep consumers testable and boundaries explicit.

## Parse all path files at boot

Rejected. It ignores GTA's own streamed-area design and wastes startup CPU/memory for data that may never be needed.

## Global all-node nearest search

Rejected. The original 8x8 area layout already provides a suitable spatial index and scales better.

# Future Extension Points

- Pedestrian population can request nearby pedestrian nodes from the same provider.
- WalkAround can use the wandering primitive; Escape/Chase/Follow can request explicit destinations through the same NavigationAgent.
- Vehicle traffic can reuse vehicle nodes, navi links, lanes, highway, water, parking, traffic level, intersection, and traffic-light metadata already parsed.
- Dynamic/interior path areas beyond the outdoor 64 can be added later using the same generic graph boundary.
- SCM/mission systems can toggle ENEX runtime access by stable entry ID.
- Shop/gym/restaurant/barber/tattoo gameplay can attach behavior to interior/ENEX identity without modifying area streaming.
- Web Worker pathfinding can reuse serializable graph snapshots/query/result types.
- Cache eviction can be added behind PathAreaStore without changing the binary parser or A\* API.
- More sophisticated local avoidance/crowd behavior can consume the same route/waypoint contract.

# Validation Strategy

The implementation is not complete merely when TypeScript compiles.

Required validation includes:

- `npm run lint:ts`;
- `npm test`;
- GTA-backed tests after `npm run test:fixtures`;
- parser tests over synthetic exact bytes/rows and real GTA fixtures;
- fetch/build versus local-loader interior asset parity;
- browser validation entering and exiting at least one real GTA SA interior;
- correct interior objects/textures and collision at the destination;
- exterior -> interior, interior -> exterior, and interior -> interior transition tests;
- real route calculation over `nodes15.dat`;
- a route that crosses at least one path-area boundary;
- no regression in current exterior render/collision streaming;
- no regression in `EnterVehicleSystem` or `CharacterControllerSystem.runPath()`;
- debug view sanity checks for ENEX volumes, active area, nearby nodes/links, and route polyline.

# Reference Material

Implementation should verify behavior against these sources rather than copying architecture:

- Web Theft Auto repository files listed in this change proposal/request.
- SanAndreasUnity (branch `dev`): https://github.com/in0finite/SanAndreasUnity
- gta-reversed: https://github.com/gta-reversed/gta-reversed
- gta-reversed `source/game_sa/EntryExit.cpp/.h` and `EntryExitManager.cpp/.h`.
- gta-reversed `source/game_sa/PathFind.cpp/.h`.
- GTA technical documentation describing SA IPL ENEX and `nodes*.dat`.

There are no blocking open questions for implementation. Ambiguous reverse-engineered flag labels are handled by raw preservation plus fixture/behavior validation rather than deferred architecture decisions.
