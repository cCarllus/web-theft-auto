# Implementation Tasks

## 1. Test foundations and real GTA fixtures

- [ ] 1.1 Extend `scripts/test-fixtures.ts` so a clean local GTA SA installation can extract `nodes15.dat` from the IMG archives to gitignored `tests/original/path/nodes15.dat`; keep all Rockstar bytes out of Git. Verify with `npm run test:fixtures` when local source data is available.
- [ ] 1.2 Keep the existing real `tests/original/data/int_cont.ipl` fixture in the ENEX test path and add synthetic text fixtures/helpers for quoted names, malformed ENEX rows, duplicate-name pairs, flag combinations, wrap-midnight time windows, exterior/interior links, and interior-to-interior links.
- [ ] 1.3 Add byte-construction helpers for synthetic native `nodes*.dat` buffers so tests can control header counts, node kinds, fixed-point coordinates, flags, navi nodes, links, filler, navi links, link lengths, intersection bytes, cross-area targets, truncation, and trailing bytes exactly.
- [ ] 1.4 Record/confirm the pre-change baseline for `npm run lint:ts` and `npm test` before implementation begins; do not classify missing optional GTA fixtures as a code failure.

## 2. ENEX parser and renderer-agnostic map types

- [ ] 2.1 Add renderer-agnostic ENEX data types under `packages/renderware/src/parsers/text/` for all GTA SA fields plus raw 16-bit flags and stable source/order information; expose known flag accessors without deleting unknown bits.
- [ ] 2.2 Extend textual IPL parsing so `enex` is parsed while preserving the existing `parseIpl()` instance-only API for existing callers.
- [ ] 2.3 Add ENEX parser tests for every field, quoted names, malformed/short rows, invalid numeric data, raw/decoded flags, time values, and source order.
- [ ] 2.4 Extend the real `int_cont.ipl` parser test so GTA-backed runs prove real ENEX records parse with finite transforms and preserved metadata.
- [ ] 2.5 Extend `MapDefinitions` and `resolveMap()` so resolved maps expose textual ENEX in addition to instances, preserving deterministic IPL/source order. Verify existing map-resolution tests remain green.
- [ ] 2.6 Extend the existing DFF 2DFX parser with native type 6 Enter-Exit support, preserving common local position, entrance angle, radius X/Y, authored exit point/offset, exit angle, interior/area, raw flags, 8-byte name, time-on/off, sky color, and the final unknown/raw byte; keep types 0/1/7/10 unchanged.
- [ ] 2.7 Add synthetic byte-exact DFF tests for type 6 field layout, coexistence with other 2DFX entry types, declared-size skipping, malformed/truncated data, and raw-field preservation.
- [ ] 2.8 Add a renderer-agnostic normalization step that transforms placed type 6 ENEX through geometry/frame + IPL instance transforms into world-space entry/exit data, including correct point/vector treatment of the native exit field and transformed heading semantics.
- [ ] 2.9 Normalize textual IPL and placed DFF type 6 ENEX into one stable-ID collection/provider before pairing/runtime access, while retaining source kind/model/instance/effect identity for diagnostics.
- [ ] 2.10 Make 2DFX ENEX discovery independent from Three.js mesh attachment: cache parsed type-6 metadata per model, instantiate/transform it per world placement, load relevant source/target area metadata on demand, and guarantee deterministic registration/pairing regardless of render-streaming timing.
- [ ] 2.11 Add normalization/discovery tests for translated/rotated object instances, local-to-world entrance/exit coordinates, transformed headings, mixed IPL + 2DFX collections, metadata availability before mesh attachment, cache reuse across repeated model placements, and deterministic results under different streaming order.
- [ ] 2.12 Scan a clean stock GTA SA fixture source for type-6 2DFX records and add at least one reproducible real DFF fixture/test when stock data contains them; if none are present in the tested stock edition, record that inventory result and retain the byte-exact synthetic coverage instead of silently omitting the case.

## 3. Interior-aware shared asset selection

- [ ] 3.1 Move placed-instance discovery rules that are duplicated between `scripts/build-game.ts` and `packages/loaders/src/asset-local-loader/build-vfs.ts` into `packages/game-build`, with an API that can process all relevant textual IPL placements including `data/maps/interior/**` plus binary IPL streams.
- [ ] 3.2 Remove the exterior-only `/interior/` exclusion from both callers by switching them to the shared game-build discovery API; preserve existing dynamic ped/vehicle selection and archive override precedence.
- [ ] 3.3 Add `packages/game-build` tests proving a DFF/TXD referenced only by an interior placement is selected, exterior references remain selected, duplicates are deduplicated, and missing archive entries are still dropped cleanly.
- [ ] 3.4 Add local-loader tests proving the same interior-only model/TXD set is selected from equivalent source data and that existing local exterior/dynamic model tests do not regress.
- [ ] 3.5 Add an explicit parity test/helper comparing build-style and local-loader placed-reference selection on equivalent synthetic IDE/IPL/IMG-name inputs. The task is not complete until both paths apply the same selection semantics.

## 4. Area-indexed world data

- [ ] 4.1 Formalize GTA low-byte area helpers in renderware, preserving current `value & 0xff` behavior and the existing special rule that area 13 belongs to the exterior world scene.
- [ ] 4.2 Evolve `packages/renderware/src/map/world-grid.ts` from exterior-only filtering to area-indexed world data that retains hidden-interior placements and groups exterior-compatible areas 0 + 13 while preserving cell/HD/LOD partitioning.
- [ ] 4.3 Update render/collision cell-building helpers so an area/group is part of lookup identity and same X/Y coordinates in different areas cannot alias.
- [ ] 4.4 Update world-grid tests for hidden-interior retention, area 13 exterior behavior, overlapping coordinates across areas, timed objects, missing definitions, and unchanged exterior HD/LOD bucketing.

## 5. Active-area render streaming

- [ ] 5.1 Add a small generic active-area state abstraction in `packages/game` and keep GTA-specific low-byte/render-level interpretation behind the GTA adapter/provider boundary.
- [ ] 5.2 Extend the minimal world cell request path so `GtaSaWorldAdapter` can load area-keyed render cells and caches include area identity; do not add unrelated navigation/ENEX methods to `WorldAdapter`.
- [ ] 5.3 Make `StreamingSystem` consume active-area state (or an equivalent narrow provider) so desired keys include the area and incompatible loaded cells are removed on an area change.
- [ ] 5.4 Preserve current seamless HD/LOD swap, fade, manual map-viewer selection, and hysteresis behavior within an area.
- [ ] 5.5 Add streaming tests for exterior -> interior, interior -> exterior, interior -> interior, same-cell/different-area cache separation, area 13 exterior visibility, and existing exterior LOD regression cases.
- [ ] 5.6 Add a narrow target-area render prewarm/readiness API that can request destination meshes around a teleport point, report when the minimum revealable interior content is attached/ready, reject/cancel failures, and ignore stale completions after a superseding transition.
- [ ] 5.7 Add render-readiness tests for successful prewarm, collision-ready/render-pending ordering, stale cancellation, render failure, and same-coordinate/different-area cache separation.

## 6. Active-area collision streaming and readiness

- [ ] 6.1 Extend GTA collider loading/cache keys with area identity and bind only placements compatible with the requested area.
- [ ] 6.2 Make `CollisionStreamingSystem` react to active-area changes by removing incompatible static bodies and loading compatible target-area bodies without breaking breakable-object bookkeeping.
- [ ] 6.3 Add a narrow target-area collision prewarm/readiness operation that resolves only after required destination static bodies are installed in the physics world and can be cancelled/superseded safely; define its composition with render readiness through the shared area-transition preparation contract.
- [ ] 6.4 Add tests for exterior/interior collision filtering, overlapping cell coordinates across areas, area-switch body removal, destination readiness, cancellation/stale completion, load failure, and current breakable/reload behavior.

## 7. ENEX pairing and interior transition runtime

- [ ] 7.1 Add a GTA-specific ENEX resolver/provider that assigns stable entry IDs, maps raw render-area metadata to generic descriptors, and precomputes explicit linked-pair relationships.
- [ ] 7.2 Implement pairing using gta-reversed `CEntryExitManager` semantics as the behavior reference: linked-pair flags, stable source/load order, one-to-one assignment, name as a candidate key rather than the sole criterion, and deterministic handling of duplicate names.
- [ ] 7.3 Add pairing tests for simple linked pairs, duplicate names, order-sensitive candidates, one-way/unpaired entries, invalid candidates, exterior/interior pairs, and interior/interior pairs.
- [ ] 7.4 Add runtime ENEX access state separate from immutable raw flags, with a future-facing enable/disable API and default behavior matching normal GTA entries.
- [ ] 7.5 Implement eligibility helpers for active source area, `timeOn/timeOff` including midnight wrap, disable-on-foot, cars/aircraft, bikes/motorcycles, disable-exit, deleted/disabled state, while preserving unsupported flags as metadata.
- [ ] 7.6 Implement GTA-compatible ENEX containment: rotate the authored entrance rectangle in XY by `entranceAngle` and apply the dedicated GTA-style vertical acceptance rule; use the same normalized test for textual and transformed 2DFX ENEX.
- [ ] 7.7 Add trigger tests for unrotated/rotated rectangles, boundary points, vertical accept/reject cases, transformed type 6 footprints, and deterministic selection when rotated ENEX volumes overlap.
- [ ] 7.8 Add an `InteriorTransitionSystem` (or equivalently narrow runtime system) with explicit idle -> target-preparing -> committing -> suppressed states; keep this logic out of `CharacterControllerSystem`.
- [ ] 7.9 Implement directional linked-pair destination resolution from gta-reversed `CEntryExit` behavior: resolve the correct spawn point, target area, and transition heading for each direction and do not assume the counterpart's `exitPosition`/`exitAngle` are always the final transform.
- [ ] 7.10 Implement an equivalent-in-purpose `FindValidTeleportPoint()` step using existing world/collision queries so the final spawn point is clear/grounded and not embedded in geometry; abort coherently when no valid point is available.
- [ ] 7.11 During a transition, suspend player locomotion/transition re-entry, resolve/validate the destination, prewarm target render + collision, and release/reveal only when collision is ready and the selected visual-readiness policy is satisfied. If collision is ready first, keep the transition/fade blocked until render is ready.
- [ ] 7.12 Implement anti-bounce suppression keyed to the destination ENEX/pair and release suppression only after the player exits the GTA-compatible destination trigger volume; a timer may only be a supplemental guard.
- [ ] 7.13 Add unit/integration tests for time gating, runtime access, all supported movement flags, directional pair spawn/heading semantics, cases that differ from naive counterpart `exitAngle`, valid-teleport correction/failure, render+collision readiness ordering, target-load failure, anti-bounce, exterior -> interior, interior -> exterior, and interior -> interior.

## 8. Native `nodes*.dat` parser

- [ ] 8.1 Add renderer-agnostic path types in `packages/renderware`: `PathNodeId`, `PathNode`, raw/decoded node flags, node kind, `NodeLink`, `NaviNode`, `NaviNodeLink`, intersection flags, and `NodeFile/PathArea`.
- [ ] 8.2 Implement little-endian header parsing for total nodes, vehicle nodes, pedestrian nodes, navi nodes, and normal link count with checked count arithmetic and buffer-size validation before allocation.
- [ ] 8.3 Parse 28-byte path nodes exactly, including the two raw initial 32-bit fields, compressed XYZ, heuristic/runtime field, base link, area/node IDs, raw path-width byte, flood-fill byte, and raw 32-bit flags; keep vehicle and pedestrian ranges distinct.
- [ ] 8.4 Decode on-disk node flags according to validated native format: link count, traffic level, road-block, water/boat, emergency-only, highway/not-highway, spawn probability, parking/behavior metadata, while retaining the full raw word.
- [ ] 8.5 Preserve raw path width and expose documented full-width/lateral-radius semantics without rewriting the authored byte.
- [ ] 8.6 Parse 14-byte navi/car-path-link records exactly: compressed XY, attached path-node address, signed direction, raw width/lanes/traffic-light/crossing flags and raw packed bits.
- [ ] 8.7 Parse normal 4-byte node links, the 768-byte native dynamic-link filler, packed 16-bit navi links, one-byte link lengths, one-byte intersection flags, the native dynamic-reserve tails, and any additional trailing/unknown bytes.
- [ ] 8.8 Validate each node's `baseLink + linkCount` range against normal authored links so filler/other sections can never be exposed as accidental neighbors.
- [ ] 8.9 Add byte-exact synthetic tests for every section/field/flag, vehicle/ped split, fixed-point signed coordinates, widths, link ranges, cross-area links, navi flags, link lengths, intersection flags, filler/trailing preservation, impossible counts, malformed ranges, and truncated buffers.
- [ ] 8.10 Add GTA-backed sanity tests against `tests/original/path/nodes15.dat` when available; verify nonzero node counts, declared split consistency, finite decoded coordinates, valid local identities, and representative links without snapshotting proprietary bytes.

## 9. Lazy path-area store and generic GTA graph provider

- [ ] 9.1 Implement native 8x8 path-area spatial helpers for 64 areas, 750x750 units, origin (-3000,-3000), row-major IDs, bounds clamping, and position/radius-to-touched-area lookup.
- [ ] 9.2 Add tests for corners, boundaries, negative coordinates, radius overlap, row-major IDs, and out-of-grid clipping.
- [ ] 9.3 Add a GTA-specific lazy PathAreaStore over the VFS that loads `nodes{area}.dat` only on demand, deduplicates in-flight requests, caches successful parsed areas, and exposes enough cache ownership to add eviction later.
- [ ] 9.4 Verify through tests that boot/store construction parses zero areas, first access parses only requested areas, repeat/concurrent access does not duplicate parsing, failures are surfaced, and a later eviction policy would not change node identities/parser contracts.
- [ ] 9.5 Add narrow generic `NavigationGraphProvider` interfaces in `packages/game` and a GTA provider that translates renderware `PathNodeId`/flags/links into generic node/edge records without leaking renderware types.
- [ ] 9.6 Resolve cross-area neighbors lazily: preserve unresolved target identities until needed, load target area on traversal, and handle missing/malformed target areas without dereferencing invalid nodes.

## 10. Spatial nearest-node lookup

- [ ] 10.1 Implement nearest-node lookup through the generic/GTA provider using only path areas touched by the requested radius, squared geometric distance, node-kind selection, filters, and stable tie-breaking.
- [ ] 10.2 Make ordinary pedestrian queries exclude vehicle nodes and emergency-only/non-ambient nodes according to the configured/default pedestrian filter while allowing explicit specialized filters to opt in.
- [ ] 10.3 Return explicit not-found when no acceptable node lies within radius; do not fall back to a global 64-area scan for an arbitrarily distant node.
- [ ] 10.4 Add tests for source/destination nearest lookup, area-boundary searches, deterministic ties, ped-vs-vehicle split, emergency-only filtering, custom filters, and empty/no-match results.

## 11. Pure TypeScript A\* pathfinder

- [ ] 11.1 Define asynchronous, cancellation-friendly, serializable-in-concept path request/result types with explicit `found`, `no-path`, `cancelled`, `invalid-source`, and `invalid-destination` outcomes.
- [ ] 11.2 Implement the pure A\* search kernel over generic node IDs/providers with open set, best-cost/closed state, parents, deterministic priority/tie-breaking, and source-to-destination reconstruction.
- [ ] 11.3 Use a valid positive authored GTA link length as edge cost and geometric edge distance as fallback for missing/invalid cost.
- [ ] 11.4 Use geometric straight-line distance as the heuristic only at a conservative admissible scale; detect/handle authored costs that under-represent geometry by reducing the scale, including zero/Dijkstra behavior when necessary.
- [ ] 11.5 Check cancellation during area preparation and at bounded search-expansion intervals so superseded work exits without committing stale results.
- [ ] 11.6 Add tests for a simple path, junctions, equal-cost deterministic ties, a strictly cheaper multi-edge route, disconnected graph, invalid endpoints, authored-cost preference, geometric fallback, heuristic admissibility fallback, path reconstruction, cancellation, and real/synthetic cross-area expansion.
- [ ] 11.7 Add a real GTA-backed route sanity test over `nodes15.dat` and a cross-area route test using real fixtures/local runtime where practical; assert route continuity and valid neighbor relationships rather than hardcoding proprietary node bytes.

## 12. NavigationAgent / NpcNavigation route following

- [ ] 12.1 Add a generic NavigationAgent state model that owns destination, request generation, pending/active route, current waypoint, previous waypoint, status, stopping distance, and cancellation/replan state but not ECS/physics bodies.
- [ ] 12.2 Make setting/changing/cancelling a destination issue or supersede path requests safely; apply only results matching the current request generation.
- [ ] 12.3 Implement deterministic waypoint advancement and final arrival/stopping-distance behavior, including bounded advancement over already-satisfied tiny waypoints.
- [ ] 12.4 Integrate authored path width into waypoint target/tolerance handling while keeping zero/narrow paths bounded by navigation configuration.
- [ ] 12.5 Add stable seeded lateral target selection inside the authored path corridor so agents do not regenerate random centerline offsets every frame.
- [ ] 12.6 Emit finite desired movement direction/target/speed-state outputs for a locomotion consumer instead of directly mutating Rapier/ECS velocity.
- [ ] 12.7 Add tests for set/cancel destination, pending/found/no-route states, stale request rejection, waypoint advancement, width/tolerance, stopping distance, deterministic target offsets, arrival, invalid routes, and movement intent.

## 13. Steering, blocked handling, replanning, and wandering primitives

- [ ] 13.1 Define a narrow physics-independent obstacle/clearance query/result interface and implement bounded steering correction that can blend local avoidance with the current route direction.
- [ ] 13.2 Track route progress/stall state and expose blocked behavior without generating non-finite/oscillating movement when no local avoidance is available.
- [ ] 13.3 Implement explicit and blocked-triggered replanning with a minimum replan interval, cancellation/supersession of older requests, and no A\* work on ordinary per-frame updates.
- [ ] 13.4 Add a reusable ambient-wander helper: find nearby acceptable ped node, choose linked nodes, prefer normal/non-emergency nodes, avoid immediately returning to the previous node when alternatives exist, and choose a stable point inside path width.
- [ ] 13.5 Add deterministic tests for clear steering, obstacle correction, no-clearance blocked state, stall threshold, replan throttle, stale replan results, wander next-link choice, previous-node avoidance, only-backtrack case, and seeded corridor offsets.
- [ ] 13.6 Do NOT add pedestrian spawning or full WalkAround/Escape/Chase/Follow AI states in this task group; document the new API as their later dependency.

## 14. Browser debug tooling

- [ ] 14.1 Extend the existing debugger/debug-actions bridge to report active area/interior and current interior-transition state without making the runtime depend on React.
- [ ] 14.2 Add optional ENEX visualization showing the rotated XY trigger footprint + vertical range, stable ID/name, source kind (text IPL or DFF 2DFX), source/target area, pair link, resolved teleport point/heading, render/collision readiness, eligibility, and suppression state.
- [ ] 14.3 Add optional pedestrian path visualization showing nearby node IDs/positions, path widths, relevant flags, normal/cross-area links, and loaded path-area boundaries/cache state.
- [ ] 14.4 Add a debug route request that accepts start/destination positions and draws the selected nearest nodes and resulting route/status/cost.
- [ ] 14.5 Add unit/component tests where practical and manually verify that disabling debug tools has no effect on ENEX, path loading, pathfinding, or agent behavior.

## 15. Integration, regression, browser, and performance validation

- [ ] 15.1 Add integration tests proving active-area render and collision filtering switch together and same-coordinate cells from different areas never alias.
- [ ] 15.2 Add integration tests proving an ENEX transition cannot release the player until target collision is ready and cannot reveal an empty destination while required render meshes are pending; include independent render/collision completion order, load failure/cancellation, safe teleport correction, and anti-bounce after placement.
- [ ] 15.3 Add end-to-end/local browser validation using a legitimate GTA SA installation: enter at least one real exterior ENEX, verify the correct original interior DFF/TXD content and collision are ready before reveal/control, move inside without falling through or spawning inside geometry, and exit to the correct GTA-resolved exterior position/heading.
- [ ] 15.4 Validate at least one interior-to-interior transition where real data provides a suitable case, or cover it with an integration fixture plus real exterior/interior browser case if no stable manual GTA case is selected; include at least one transformed DFF 2DFX type 6 ENEX in real/synthetic integration coverage.
- [ ] 15.5 Validate a real pedestrian route on `nodes*.dat` plus a route crossing at least one native path-area boundary; inspect the route through debug drawing for continuity.
- [ ] 15.6 Add/retain regression tests for current exterior streaming, collision streaming, area 13, breakables, map viewer/manual selection, `CharacterControllerSystem.runPath()`, and `EnterVehicleSystem` approach/cancel/entry behavior.
- [ ] 15.7 Profile representative nearest-node and A\* queries to confirm they do not scan all 64 areas, do not parse all path files at boot, and do not execute pathfinding every navigation frame.
- [ ] 15.8 Verify repeated route requests and multi-agent-style synthetic loads reuse path-area caches and respect replan throttling; note any allocation/performance follow-up that is not a correctness blocker.
- [ ] 15.9 Run `npm run lint:ts`, `npm test`, and GTA-backed fixture tests. Do not mark this task complete for a compile-only result or when required behavior tests are skipped unintentionally.

## 16. Documentation and master-checklist completion

- [ ] 16.1 Document the active-area/ENEX flow, textual + DFF 2DFX type 6 sources, supported ENEX flags, rotated trigger/vertical semantics, linked spawn/heading resolution, safe teleport validation, area 13 semantics, render+collision readiness/fade behavior, and intentionally deferred interior gameplay.
- [ ] 16.2 Document the native `nodes*.dat` parser/store, 8x8 lazy loading, graph provider, A\* cost/heuristic rules, NavigationAgent boundary, cancellation/replan contract, and future Web Worker/traffic extension points.
- [ ] 16.3 Document how to regenerate `tests/original/path/nodes15.dat` through `npm run test:fixtures` and reiterate that GTA fixtures/assets are local/gitignored.
- [ ] 16.4 Update `docs/WEB_THEFT_AUTO_IMPLEMENTATION_MASTER_CHECKLIST.md` items 8, 9, and 10 only after their acceptance criteria actually pass; do not mark items 14 (ped population) or 15 (full Ped AI) complete as a side effect of navigation infrastructure.
- [ ] 16.5 Perform the final acceptance pass: `npm run lint:ts`, `npm test`, GTA fixture suite, textual + DFF ENEX coverage, browser interior entry/exit, correct render/collision readiness before reveal, rotated trigger/teleport semantics, safe spawn correction, real node route, cross-area route, exterior streaming regression, and EnterVehicle/runPath regression. Record any remaining limitation before considering the OpenSpec change ready to archive.
