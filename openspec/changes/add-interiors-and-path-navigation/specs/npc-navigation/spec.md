# NPC Navigation

## Purpose

Define observable behavior for generic path planning and route-following infrastructure over GTA-derived path graphs, separating graph search from per-frame steering so later pedestrian population and Ped AI systems can reuse the same foundation without coupling navigation to RenderWare, React, Three.js, Rapier, or Unity NavMesh APIs.

## ADDED Requirements

### Requirement: Path planning and navigation are separate responsibilities

The system SHALL separate graph route planning from frame-by-frame route following and steering.

#### Scenario: Consumer requests a route

- **WHEN** a caller asks for a path from world position A to world position B
- **THEN** path planning SHALL return a route/result without moving an entity or mutating physics state

#### Scenario: Agent follows an existing route

- **WHEN** a NavigationAgent updates with a valid planned route
- **THEN** it SHALL produce movement intent for the current frame without rerunning graph search merely because a frame elapsed

### Requirement: Core navigation is independent of GTA rendering and physics libraries

The generic pathfinder and navigation-agent logic SHALL NOT require React, Three.js, Rapier, DOM APIs, or RenderWare parser types.

#### Scenario: Pathfinder is tested with an in-memory graph

- **WHEN** tests provide a generic graph with positions, neighbors, and costs
- **THEN** route planning SHALL run without constructing renderer, browser, VFS, GTA parser, or physics objects

#### Scenario: NavigationAgent is tested with synthetic movement inputs

- **WHEN** tests provide current position and route state
- **THEN** movement intent SHALL be computable without a Rapier world or Three.js scene

### Requirement: GTA graph data is exposed through a generic navigation provider

The game navigation layer SHALL consume a provider abstraction that exposes stable node identity, position, usable metadata, path width, neighbors, and edge cost without leaking GTA-specific parser structures into the core algorithm.

#### Scenario: GTA path node is adapted

- **WHEN** a GTA pedestrian path node is supplied through the GTA navigation provider
- **THEN** the generic pathfinder SHALL be able to inspect its position, neighbors, width, and routing metadata without importing a GTA `PathNode` type

#### Scenario: Synthetic provider is substituted

- **WHEN** a test or future game mode supplies another implementation of the same provider
- **THEN** the same pathfinder SHALL operate on it without GTA-specific branches

### Requirement: Route planning resolves nearest pedestrian source and destination nodes

A normal NPC path request SHALL resolve an acceptable nearby pedestrian source node and destination node before graph search.

#### Scenario: Valid nearby endpoints exist

- **WHEN** acceptable pedestrian nodes exist within the configured source and destination search radii
- **THEN** route planning SHALL use the nearest acceptable node for each endpoint with deterministic tie-breaking

#### Scenario: Source has no acceptable nearby node

- **WHEN** no acceptable pedestrian source node exists inside the configured radius
- **THEN** the request SHALL return an explicit invalid-source result

#### Scenario: Destination has no acceptable nearby node

- **WHEN** no acceptable pedestrian destination node exists inside the configured radius
- **THEN** the request SHALL return an explicit invalid-destination result

### Requirement: Default pedestrian routing filters emergency-only nodes

Ordinary pedestrian route requests SHALL support node filters and SHALL exclude emergency-only nodes by default unless the caller explicitly permits them.

#### Scenario: Normal and emergency-only alternatives exist

- **WHEN** an ordinary pedestrian route can use either a normal node or an emergency-only node
- **THEN** the emergency-only node SHALL be excluded from the normal candidate/expansion set

#### Scenario: Caller permits emergency-only routing

- **WHEN** a specialized request explicitly allows emergency-only nodes
- **THEN** those nodes MAY participate in nearest-node lookup and graph expansion

### Requirement: A-star is the route-search algorithm

The pathfinder SHALL use A\* over the supplied graph with an open set, closed/visited cost state, parent tracking, and source-to-destination path reconstruction.

#### Scenario: Simple chain

- **WHEN** the graph is A -> B -> C and A/C are selected endpoints
- **THEN** the returned route SHALL contain the connected sequence from A through B to C

#### Scenario: Junction with unequal route cost

- **WHEN** two valid routes connect the same endpoints with different total costs
- **THEN** A\* SHALL return a route whose total cost is minimal under the configured edge-cost function

#### Scenario: Disconnected graph

- **WHEN** no graph connection exists between valid source and destination nodes
- **THEN** the result SHALL be `no-path` rather than a fabricated partial success

### Requirement: A-star route results are deterministic

For identical graph data, request parameters, filters, and endpoint positions, the pathfinder SHALL return the same route ordering across repeated runs.

#### Scenario: Equal-cost alternatives exist

- **WHEN** multiple frontier nodes have equal A\* priority
- **THEN** a documented stable tie-breaker based on cost and canonical node identity/insertion order SHALL produce the same selected route on repeated runs

#### Scenario: Provider returns neighbors in unstable collection order

- **WHEN** equivalent neighbor records are supplied in a different incidental iteration order
- **THEN** deterministic normalization/tie-breaking SHALL prevent nondeterministic path output

### Requirement: Authored link length is preferred as edge cost

A path edge SHALL use a valid positive GTA-authored link length when supplied by the graph provider and SHALL use geometric distance only as a documented fallback when authored cost is unusable.

#### Scenario: Authored length is valid

- **WHEN** an edge exposes a finite positive authored link length
- **THEN** that authored value SHALL be used as the edge traversal cost

#### Scenario: Authored length is missing or invalid

- **WHEN** an edge has no usable authored length
- **THEN** the pathfinder SHALL fall back to finite geometric distance between the connected nodes

### Requirement: Geometric heuristic preserves shortest-cost correctness

The A\* heuristic SHALL be based on geometric distance while remaining conservative enough that authored edge-cost quantization cannot cause a higher-cost route to be returned as optimal.

#### Scenario: Edge costs are compatible with straight-line geometry

- **WHEN** geometric distance is admissible for the current usable edge costs
- **THEN** A\* MAY use straight-line geometric distance directly or with a conservative scale

#### Scenario: Authored costs under-represent geometric distance

- **WHEN** the graph contains valid authored costs that would make an unscaled geometric heuristic inadmissible
- **THEN** the pathfinder SHALL reduce the heuristic conservatively, including degrading to zero if necessary, rather than sacrificing minimal-cost correctness

### Requirement: Routes can cross GTA path-area boundaries

The pathfinder SHALL follow graph links between different lazily loaded path areas.

#### Scenario: Route crosses one area boundary

- **WHEN** the only valid route links a node in area A to a node in area B
- **THEN** the provider/store SHALL make the linked area available and A\* SHALL reconstruct one continuous cross-area route

#### Scenario: Linked target area is unavailable

- **WHEN** a required linked path area cannot be loaded
- **THEN** the query SHALL fail/no-path according to the documented provider failure policy and SHALL NOT dereference a missing target node

### Requirement: Path requests support cancellation

The asynchronous route API SHALL allow an in-flight request to be cancelled and SHALL prevent cancelled work from becoming the active route of a NavigationAgent.

#### Scenario: Cancellation during area preparation

- **WHEN** an AbortSignal or equivalent request token is cancelled while required path areas are loading
- **THEN** the request SHALL resolve/reject as cancelled according to the public contract and SHALL NOT continue into a committed route

#### Scenario: Cancellation during graph expansion

- **WHEN** cancellation occurs while A\* is expanding nodes
- **THEN** the search SHALL stop at a bounded cancellation check and SHALL NOT return a found route as current

### Requirement: Path query results are replan-friendly and worker-friendly

The public route request/result shape SHALL be asynchronous, serializable in concept, and independent from mutable render/physics objects so it can later be executed in a Web Worker without redesigning NPC consumers.

#### Scenario: Query returns a found route

- **WHEN** a route succeeds
- **THEN** the result SHALL contain stable node/waypoint data and status without scene-object or physics-body references

#### Scenario: Query is superseded

- **WHEN** a newer request replaces an older request before the older one completes
- **THEN** the older result SHALL be identifiable as stale/cancelled and SHALL NOT overwrite the newer route

### Requirement: NavigationAgent accepts and cancels destinations

A NavigationAgent SHALL support setting a destination, maintaining a current request/route, cancelling navigation, and reporting its current navigation status.

#### Scenario: Set destination

- **WHEN** a destination is assigned to an idle agent
- **THEN** the agent SHALL request a route and enter a pending/following state according to the request result

#### Scenario: Cancel destination

- **WHEN** navigation is cancelled
- **THEN** any in-flight route request SHALL be cancelled or ignored, active route state SHALL clear, and the agent SHALL no longer emit forward route-following intent

### Requirement: NavigationAgent advances waypoints deterministically

An agent SHALL track a current waypoint and SHALL advance only when its arrival rule for that waypoint is satisfied.

#### Scenario: Agent is outside waypoint tolerance

- **WHEN** the current position is farther than the waypoint's allowed arrival tolerance
- **THEN** the current waypoint index SHALL remain unchanged

#### Scenario: Agent reaches waypoint tolerance

- **WHEN** the current position enters the allowed waypoint tolerance
- **THEN** the agent SHALL advance to the next waypoint exactly once

#### Scenario: Multiple tiny waypoints are already within tolerance

- **WHEN** more than one consecutive waypoint is already satisfied in a single update
- **THEN** the agent MAY advance through them deterministically without oscillating backward

### Requirement: Waypoint arrival accounts for authored path width

The route-following layer SHALL be able to use path/corridor width when determining a usable target/tolerance, rather than requiring every agent to touch the exact node center.

#### Scenario: Wide pedestrian path

- **WHEN** a waypoint belongs to a wide authored corridor
- **THEN** the agent SHALL be able to advance within a bounded tolerance/target region derived from that corridor

#### Scenario: Narrow or zero-width path

- **WHEN** path width is narrow or zero
- **THEN** waypoint tolerance SHALL remain bounded by navigation configuration and SHALL NOT become arbitrarily large

### Requirement: NavigationAgent honors stopping distance

The agent SHALL stop route-following movement when the final destination is within the configured stopping distance.

#### Scenario: Destination is still outside stopping distance

- **WHEN** the final destination remains farther than stopping distance
- **THEN** the agent SHALL continue to produce route-following movement intent

#### Scenario: Destination is reached

- **WHEN** the final destination falls within stopping distance after required waypoints have been satisfied
- **THEN** the agent SHALL report arrived and SHALL emit no further forward movement requirement for that destination

### Requirement: NavigationAgent emits desired movement instead of directly moving physics

Per-frame navigation SHALL output a desired movement direction/target state for a locomotion consumer rather than directly mutating character bodies.

#### Scenario: Route has a current waypoint

- **WHEN** an agent is actively following a valid route
- **THEN** update SHALL produce a finite planar desired direction toward the steering target

#### Scenario: Agent is arrived or cancelled

- **WHEN** the agent has arrived or navigation is cancelled
- **THEN** it SHALL emit a stopped/no-route-following movement intent

### Requirement: Path-width offsets avoid centerline-only wandering

The navigation layer SHALL support choosing a stable deterministic point inside an authored pedestrian path corridor so independent pedestrians need not all target the mathematical centerline.

#### Scenario: Select an offset target

- **WHEN** a route waypoint has usable path width and the agent has a deterministic navigation seed
- **THEN** the selected target point SHALL remain inside the corridor and SHALL be repeatable for the same seed/state

#### Scenario: Repeated frames follow the same waypoint

- **WHEN** the current waypoint has not changed
- **THEN** the lateral target SHALL NOT be randomly regenerated every frame

### Requirement: NavigationAgent supports explicit replanning

The agent SHALL support replacing an invalid/stale route with a newly planned route without accepting stale results from an earlier generation.

#### Scenario: Destination changes

- **WHEN** the destination changes materially while a route is active
- **THEN** the agent SHALL supersede/cancel the older request and request a route for the new destination

#### Scenario: Consumer requests replan

- **WHEN** a caller explicitly marks the route for replanning
- **THEN** the next permitted replan cycle SHALL request a new route

#### Scenario: Older result completes later

- **WHEN** an earlier superseded route request completes after a newer request
- **THEN** the older result SHALL be ignored

### Requirement: Automatic replanning is throttled

Blocked/stalled navigation SHALL NOT trigger expensive pathfinding every frame.

#### Scenario: Agent is temporarily obstructed

- **WHEN** progress pauses for less than the configured blocked threshold
- **THEN** the agent SHALL continue local steering without immediately issuing repeated A\* requests

#### Scenario: Agent remains blocked

- **WHEN** progress remains below threshold long enough to qualify as blocked
- **THEN** the agent MAY request a replan no more frequently than the configured minimum replan interval

### Requirement: Basic steering can react to obstacles without coupling to Rapier

The agent SHALL accept obstacle/clearance information through a narrow physics-independent boundary and SHALL be able to blend a bounded avoidance correction with route direction.

#### Scenario: No obstacle is reported

- **WHEN** the steering query reports a clear route
- **THEN** desired movement SHALL follow the current route target without an invented avoidance turn

#### Scenario: Obstacle is reported ahead

- **WHEN** a runtime steering query reports an obstacle with usable side clearance
- **THEN** the agent SHALL be able to bias desired movement toward a valid clearance direction while retaining the current route

#### Scenario: No usable avoidance exists

- **WHEN** the obstacle query reports no viable local steering direction
- **THEN** the agent SHALL report/stabilize a blocked condition rather than produce non-finite or rapidly oscillating movement

### Requirement: Ambient wandering primitives are reusable but do not implement Ped AI

The navigation foundation SHALL expose enough reusable behavior for a later WalkAround state to choose linked pedestrian nodes without implementing population or a complete AI state machine in this change.

#### Scenario: Wandering agent reaches a node

- **WHEN** a wandering helper needs a next target and the current pedestrian node has multiple eligible links
- **THEN** it SHALL be able to choose an eligible linked node deterministically

#### Scenario: Previous node has alternatives

- **WHEN** the previous node is one candidate and at least one other valid linked pedestrian node exists
- **THEN** the helper SHALL prefer an alternative rather than immediately reversing to the previous node

#### Scenario: Only previous node is valid

- **WHEN** the previous node is the only eligible link
- **THEN** the helper MAY choose it rather than becoming permanently stuck

### Requirement: No-route and invalid-route states are explicit

Navigation failures SHALL be represented as explicit states/results and SHALL not leave stale movement active.

#### Scenario: Pathfinder returns no-path

- **WHEN** a valid endpoint pair is disconnected
- **THEN** the agent SHALL enter a no-route/failed state and SHALL stop following any obsolete route

#### Scenario: Active route contains an unresolved node

- **WHEN** route validation discovers that the next waypoint can no longer be resolved
- **THEN** the route SHALL be marked invalid and MAY trigger a throttled replan

### Requirement: Existing scripted player runPath remains unchanged

The addition of graph navigation SHALL NOT require `CharacterControllerSystem.runPath()` or `EnterVehicleSystem` to depend on the GTA path graph.

#### Scenario: Player approaches a vehicle door

- **WHEN** EnterVehicleSystem supplies its existing short world-space door path
- **THEN** CharacterControllerSystem SHALL continue to execute that path and report arrival without loading `nodes*.dat`

#### Scenario: Vehicle approach is cancelled

- **WHEN** the existing vehicle approach is cancelled
- **THEN** the empty-path/manual-control behavior SHALL remain functional

### Requirement: Debug route visualization is optional and observational

Developer tooling SHALL be able to request and display a pathfinding route without becoming part of navigation correctness.

#### Scenario: Developer requests a debug route

- **WHEN** the browser debug tooling specifies start and destination positions
- **THEN** it SHALL be able to display route status, selected nearby nodes, and the resulting waypoint/link polyline

#### Scenario: Debug UI is absent

- **WHEN** navigation runs without debug tooling mounted
- **THEN** nearest-node lookup, A\*, cancellation, replanning, and steering SHALL behave identically

### Requirement: Real GTA routing is validated

The capability SHALL not be considered complete solely because synthetic graphs pass.

#### Scenario: Real nodes15 route

- **WHEN** a real `nodes15.dat` fixture is available
- **THEN** a pedestrian path query over nodes from that area SHALL return a structurally valid route where one exists

#### Scenario: Real cross-area route

- **WHEN** a start/destination pair requires at least one native cross-area path link
- **THEN** the runtime SHALL load the required neighboring area(s) and return a continuous route where one exists

### Requirement: Navigation infrastructure does not implement pedestrian population or full Ped AI

This change SHALL stop at reusable navigation infrastructure.

#### Scenario: Change is complete

- **WHEN** all navigation acceptance criteria pass
- **THEN** no requirement SHALL exist to spawn ambient pedestrians, implement complete WalkAround/Escape/Chase/Follow state machines, or complete master checklist items 14 and 15 as part of this change
