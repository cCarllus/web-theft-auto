# Interiors / ENEX

## Purpose

Define observable behavior for loading GTA San Andreas entry/exit records, selecting interior assets, maintaining explicit active-area state, streaming only compatible world/collision data, and transitioning the player between exterior and original interiors without coordinate-offset hacks.

## ADDED Requirements

### Requirement: Textual IPL ENEX records are parsed completely

The system SHALL parse `enex` rows from textual GTA San Andreas IPL files and preserve every authored ENEX field: entrance position, entrance angle, entrance size/radius, exit position, exit angle, target area/interior, flags, name, sky color, ped spawn count, time-on, and time-off.

#### Scenario: Parse a complete ENEX row

- **WHEN** a textual IPL contains a valid ENEX row with all GTA SA fields
- **THEN** the parsed entry SHALL expose every field with finite numeric values and the authored name

#### Scenario: Preserve a quoted ENEX name

- **WHEN** an ENEX name is quoted and contains whitespace
- **THEN** the parsed name SHALL preserve the intended string without splitting it into extra columns

#### Scenario: Reject a malformed ENEX row

- **WHEN** an ENEX row is missing required fields or contains an invalid required numeric value
- **THEN** the parser SHALL NOT emit a partially fabricated entry with default coordinates

### Requirement: DFF 2DFX type 6 Enter-Exit records are parsed completely

The system SHALL parse GTA San Andreas DFF 2DFX type 6 Enter-Exit effects and preserve their native source data, including common geometry-local position, entrance angle, entrance radius X/Y, authored exit position/offset, exit angle, interior/area, raw flags, 8-byte name, time-on, time-off, sky color, and final unknown/raw byte.

#### Scenario: Parse a complete type 6 effect

- **WHEN** a DFF geometry contains a valid 2DFX type 6 Enter-Exit record
- **THEN** the parsed effect SHALL expose every known native field plus the raw flags/unknown byte needed for lossless interpretation

#### Scenario: Type 6 coexists with other 2DFX effects

- **WHEN** one 2DFX plugin contains lights, particles, ENEX, roadsigns, or escalators together
- **THEN** parsing type 6 SHALL NOT regress or reorder the already-supported effect records

#### Scenario: Reject a truncated type 6 effect

- **WHEN** a type 6 entry declares or contains insufficient bytes for its native layout
- **THEN** the parser SHALL fail/skip according to the binary-parser policy and SHALL NOT fabricate an ENEX with default transforms

### Requirement: Placed 2DFX ENEX is transformed into world space

A DFF-authored ENEX SHALL be transformed through the owning model/frame and IPL instance transform before entering the runtime ENEX collection.

#### Scenario: Transform the entrance point

- **WHEN** a placed object contains a geometry-local type 6 ENEX
- **THEN** the normalized entrance position SHALL equal the effect position transformed by the placed object's world transform

#### Scenario: Transform the exit point or offset

- **WHEN** a type 6 ENEX stores its exit relative to the local entry/effect position
- **THEN** normalization SHALL apply point/vector semantics consistent with the native format and the placed object's transform

#### Scenario: Transform ENEX headings

- **WHEN** the placed object is rotated
- **THEN** the normalized entrance and exit heading semantics SHALL rotate with the object rather than remaining in untransformed model-local orientation

### Requirement: Textual and 2DFX ENEX share one normalized runtime

After source-specific parsing/transformation, textual IPL ENEX and placed DFF 2DFX type 6 ENEX SHALL participate in the same pairing, access, trigger, transition, suppression, and debug runtime.

#### Scenario: Pair sources can coexist

- **WHEN** resolved map data contains textual ENEX and placed type 6 ENEX
- **THEN** both SHALL be represented by the same normalized entry/exit provider and stable-ID model

#### Scenario: 2DFX ENEX participates in runtime rules

- **WHEN** the player reaches a normalized type 6 ENEX
- **THEN** the same active-area, flag, time, pairing, transition, anti-bounce, and readiness rules SHALL apply as for a textual ENEX

### Requirement: 2DFX ENEX discovery is independent of render attachment

The runtime SHALL discover and normalize relevant placed DFF type 6 ENEX metadata without requiring the host model mesh to have already been attached to the rendered scene.

#### Scenario: ENEX metadata is queried before the host mesh is attached

- **WHEN** the player approaches an area containing a placed model with a type 6 ENEX and the model's visual mesh has not yet been attached
- **THEN** the ENEX provider SHALL still be able to discover, transform, and expose that entry for trigger/pairing purposes

#### Scenario: The same DFF model is placed multiple times

- **WHEN** multiple world instances reference one DFF containing type 6 ENEX metadata
- **THEN** source metadata MAY be cached once per model while each placement SHALL receive its own correctly transformed stable runtime ENEX identity

#### Scenario: Render streaming order changes

- **WHEN** equivalent map data is streamed in a different visual cell/model order
- **THEN** the final normalized ENEX registration and pairing result SHALL remain deterministic

### Requirement: ENEX flags are losslessly preserved

The system SHALL preserve the complete authored ENEX flag word and SHALL expose known flag meanings without discarding unknown or currently unsupported bits.

#### Scenario: Parse known flags

- **WHEN** a row contains flags for linked-pair creation, vehicle access, on-foot disabling, exit disabling, or access state
- **THEN** the parsed entry SHALL allow each corresponding bit to be observed independently

#### Scenario: Preserve unsupported bits

- **WHEN** a row contains one or more flag bits whose gameplay behavior is not implemented by this change
- **THEN** those bits SHALL remain present in the raw flag value

### Requirement: Resolved map data exposes ENEX entries

Resolved GTA world entry/exit data SHALL expose textual IPL ENEX and normalized placed DFF type 6 ENEX while continuing to expose normal placement instances.

#### Scenario: Resolve an IPL containing instances and ENEX

- **WHEN** map resolution loads a textual IPL containing both `inst` and `enex` sections
- **THEN** both the placement instances and ENEX entries SHALL be available in the resolved map

#### Scenario: Resolved data includes placed type 6 ENEX

- **WHEN** a world placement references a DFF containing a type 6 ENEX
- **THEN** the normalized world entry/exit provider SHALL be able to expose that transformed ENEX together with textual IPL entries

#### Scenario: Existing instance-only parsing remains usable

- **WHEN** a caller requests only normal IPL placement instances
- **THEN** existing instance parsing behavior SHALL remain available without requiring the caller to consume ENEX data

### Requirement: The runtime has an explicit active area

The runtime SHALL represent the currently active GTA render/interior area explicitly rather than separating interiors through a vertical coordinate offset.

#### Scenario: Start in exterior

- **WHEN** a game session starts in the normal world
- **THEN** the active area SHALL represent the exterior world

#### Scenario: Activate a hidden interior

- **WHEN** a valid interior transition commits to target area N
- **THEN** the active area SHALL become N without modifying authored world coordinates by an artificial height offset

### Requirement: Area 13 follows GTA exterior semantics

The system SHALL treat low-byte GTA area 13 as part of the exterior world scene while treating hidden interior areas as distinct active areas.

#### Scenario: Exterior includes area 13 placements

- **WHEN** the active area is exterior
- **THEN** placements authored for low-byte area 0 and area 13 SHALL be eligible for exterior streaming

#### Scenario: Hidden interior excludes area 13 placements

- **WHEN** the active area is a hidden interior other than area 13
- **THEN** area 13 exterior placements SHALL NOT be rendered merely because they share nearby coordinates

### Requirement: World placements are indexed by area and spatial cell

The system SHALL retain hidden-interior placements in world data and SHALL index runtime render selection by both compatible area and spatial cell.

#### Scenario: Hidden interior placement is retained

- **WHEN** a valid placement belongs to a hidden interior area
- **THEN** world indexing SHALL retain it under that interior area instead of dropping it

#### Scenario: Same coordinates exist in two areas

- **WHEN** exterior and interior placements occupy overlapping X/Y cell coordinates
- **THEN** their streaming identities SHALL remain distinct and SHALL NOT alias each other's cached content

### Requirement: Render streaming filters by active area

Render streaming SHALL display only world placements compatible with the active area while preserving the existing HD/LOD spatial streaming behavior inside that area.

#### Scenario: Exterior to interior render switch

- **WHEN** the active area changes from exterior to a hidden interior
- **THEN** incompatible exterior cells SHALL leave the rendered world and compatible target-interior content SHALL become renderable

#### Scenario: Return to exterior

- **WHEN** the active area changes from a hidden interior to exterior
- **THEN** hidden-interior cells SHALL no longer render and the normal exterior cells SHALL resume streaming

#### Scenario: Exterior LOD behavior is unchanged

- **WHEN** the active area remains exterior and the player crosses HD/LOD distance boundaries
- **THEN** the existing exterior HD/LOD streaming and hysteresis behavior SHALL continue to operate

### Requirement: Collision streaming filters by active area

Static world collision SHALL be streamed from the same compatible area as rendered world content.

#### Scenario: Exterior collision is removed for an interior

- **WHEN** the active area commits from exterior to a hidden interior
- **THEN** incompatible exterior static collision SHALL be removed from the active physics set

#### Scenario: Interior collision is active

- **WHEN** a hidden interior is active
- **THEN** collision for compatible interior placements near the player SHALL be present

#### Scenario: Area-keyed collision caches do not alias

- **WHEN** two areas contain collision at the same X/Y cell coordinates
- **THEN** cached collision for one area SHALL NOT be reused as collision for the other area

### Requirement: Interior-only assets are included in both asset-loading flows

DFF and TXD assets referenced only by interior placements SHALL be selected for both the fetch/build archive flow and the local File System Access flow.

#### Scenario: Build pipeline sees an interior-only model

- **WHEN** a model/texture pair is referenced by a valid interior placement and nowhere in the exterior
- **THEN** the fetch/build selection SHALL include its DFF and TXD when those archive entries exist

#### Scenario: Local loader sees the same interior-only model

- **WHEN** the same installation is selected through the File System Access loader
- **THEN** the local selection SHALL include the same interior-only DFF and TXD

#### Scenario: Exterior selection does not regress

- **WHEN** interior-aware selection is enabled
- **THEN** assets previously required by the exterior world SHALL remain selected

### Requirement: Asset selection rules are behaviorally consistent across loaders

For equivalent source installation contents, the build pipeline and local loader SHALL apply the same placement-to-model/texture selection rules.

#### Scenario: Compare equivalent synthetic installation data

- **WHEN** both loaders are evaluated against equivalent IDE/IPL/IMG name sets
- **THEN** their selected placed model and texture names SHALL match apart from packaging-specific representation

### Requirement: ENEX linked pairs are resolved deterministically

The system SHALL create explicit ENEX link relationships using GTA linked-pair semantics and SHALL NOT treat equal names alone as sufficient proof of a pair.

#### Scenario: Linked pair flag identifies a pairable entrance

- **WHEN** an ENEX participates in GTA linked-pair behavior
- **THEN** pair resolution SHALL produce an explicit relationship to the correct counterpart

#### Scenario: Duplicate names exist

- **WHEN** more than two ENEX records share the same name
- **THEN** resolution SHALL use pairing flags, ordering, direction/area compatibility, and one-to-one assignment to produce a deterministic result rather than linking all same-name entries interchangeably

#### Scenario: One-way or unpaired entry

- **WHEN** an ENEX has no valid counterpart
- **THEN** it SHALL remain representable without inventing a link

### Requirement: ENEX trigger containment follows GTA rotated-footprint semantics

ENEX activation SHALL use the GTA entry/exit trigger geometry: a rectangle in XY rotated by the entrance angle plus the dedicated ENEX vertical acceptance rule, rather than a generic axis-aligned or arbitrary XYZ box test.

#### Scenario: Player is inside an unrotated entrance rectangle

- **WHEN** the player's XY position is inside the authored entrance footprint and the vertical test passes
- **THEN** the ENEX SHALL be considered spatially containing the player

#### Scenario: Entrance rectangle is rotated

- **WHEN** the ENEX has a nonzero entrance angle
- **THEN** containment SHALL be evaluated in the rotated entrance frame rather than against an unrotated world-axis box

#### Scenario: XY passes but vertical test fails

- **WHEN** the player is inside the rotated XY footprint but outside the GTA-compatible vertical acceptance range
- **THEN** the ENEX SHALL NOT trigger

#### Scenario: Placed 2DFX ENEX uses the same trigger rule

- **WHEN** a type 6 ENEX has been transformed from object-local to world space
- **THEN** its resulting footprint and heading SHALL use the same rotated XY and vertical containment semantics as textual ENEX

### Requirement: ENEX eligibility respects active area and runtime access

Only an ENEX that is valid for the player's current context SHALL start a transition.

#### Scenario: Entry belongs to another area

- **WHEN** the player overlaps an ENEX whose source side is not compatible with the active area
- **THEN** no transition SHALL start

#### Scenario: Runtime access is disabled

- **WHEN** an ENEX has been disabled through runtime access state
- **THEN** overlapping it SHALL NOT start a transition

#### Scenario: Runtime access is re-enabled

- **WHEN** the same ENEX is enabled again
- **THEN** it SHALL become eligible without reparsing the IPL

### Requirement: ENEX time windows gate transitions

The system SHALL honor ENEX `timeOn` and `timeOff` using game time, including windows that wrap midnight.

#### Scenario: Player enters during active time

- **WHEN** game time is inside the ENEX time window and all other conditions are valid
- **THEN** the ENEX MAY start a transition

#### Scenario: Player enters outside active time

- **WHEN** game time is outside the ENEX time window
- **THEN** no transition SHALL start

#### Scenario: Time window wraps midnight

- **WHEN** `timeOn` is later than `timeOff`
- **THEN** the active interval SHALL correctly span midnight

### Requirement: ENEX movement-mode flags are enforced

The transition system SHALL enforce the supported on-foot and vehicle access flags without inventing behavior for unrelated metadata flags.

#### Scenario: On-foot access is disabled

- **WHEN** the player is on foot and the ENEX has disable-on-foot behavior
- **THEN** the transition SHALL NOT start

#### Scenario: Car or aircraft access is allowed

- **WHEN** the player is in a supported car/aircraft mode and the ENEX permits that vehicle category
- **THEN** vehicle mode SHALL NOT by itself block the transition

#### Scenario: Bike or motorcycle access is allowed

- **WHEN** the player is in a supported bike/motorcycle mode and the ENEX permits that category
- **THEN** vehicle mode SHALL NOT by itself block the transition

#### Scenario: Exit direction is disabled

- **WHEN** the player attempts the exit direction of an ENEX whose exit is disabled
- **THEN** the transition SHALL NOT commit

### Requirement: Target render and collision are ready before the destination is revealed

An interior transition SHALL prewarm required target-area collision and render content. Player physics/control SHALL remain blocked until collision is ready, and the destination SHALL remain hidden/faded until required destination meshes are ready.

#### Scenario: Target render and collision load successfully

- **WHEN** an eligible transition begins and both target collision and required destination render content become ready
- **THEN** the transition MAY reveal the target area and release normal player control

#### Scenario: Collision is still loading

- **WHEN** target collision has not reported readiness
- **THEN** the player SHALL NOT be released at the target position where gravity could drop them through unloaded geometry

#### Scenario: Collision is ready but render content is still loading

- **WHEN** target collision is ready but the minimum destination meshes are not yet ready
- **THEN** the transition SHALL keep the destination hidden/faded or otherwise visually blocked rather than reveal an empty interior frame

#### Scenario: Target collision loading fails

- **WHEN** target collision preparation fails
- **THEN** the transition SHALL abort or restore a coherent source-area state rather than leaving the player in a partially switched world

#### Scenario: Target render loading fails

- **WHEN** required destination render preparation fails
- **THEN** the transition SHALL abort or remain in a defined failure/blocked state and SHALL NOT present an empty interior as a successful transition

### Requirement: A committed ENEX transition follows CEntryExit destination semantics

A successful transition SHALL resolve destination position, area, and heading using the applicable source/link direction semantics of GTA's entry/exit system rather than assuming that every paired transition simply uses the counterpart record's exit position and exit angle.

#### Scenario: Exterior to interior

- **WHEN** the player enters a valid exterior ENEX linked to an interior
- **THEN** the player SHALL appear at the GTA-resolved linked spawn point with the correct target area and transition heading

#### Scenario: Interior to exterior

- **WHEN** the player uses the corresponding interior exit
- **THEN** the player SHALL return to the GTA-resolved exterior spawn point with exterior active and the correct directional heading

#### Scenario: Interior to interior

- **WHEN** a valid ENEX links one hidden interior context to another
- **THEN** the transition SHALL activate the target interior and use the correct linked/directional spawn transform

#### Scenario: Counterpart exitAngle is not the correct final heading

- **WHEN** a paired ENEX case has a final GTA transition heading that differs from naively copying the counterpart's `exitAngle`
- **THEN** the runtime SHALL use the GTA-compatible resolved heading

### Requirement: Teleport destinations are validated against world geometry

Before committing the player transform, the transition system SHALL perform a collision/world validity search equivalent in purpose to GTA's `CEntryExit::FindValidTeleportPoint()`.

#### Scenario: Authored teleport point is valid

- **WHEN** the resolved destination has usable floor/clearance and does not intersect invalid solid geometry
- **THEN** the authored/resolved point MAY be used unchanged

#### Scenario: Authored teleport point intersects invalid geometry

- **WHEN** the resolved destination would place the player inside blocked world geometry
- **THEN** the transition SHALL search/correct to a nearby valid teleport point according to the GTA-compatible validity policy before releasing the player

#### Scenario: No valid teleport point can be found

- **WHEN** destination validation cannot find a safe point
- **THEN** the transition SHALL fail/abort coherently rather than place the player inside geometry

### Requirement: ENEX transitions suppress immediate bounce-back

After a successful transition, the destination trigger SHALL be suppressed until the player leaves its trigger volume.

#### Scenario: Player lands inside destination trigger

- **WHEN** a transition places the player within the destination ENEX volume
- **THEN** the destination ENEX SHALL NOT immediately trigger the reverse transition

#### Scenario: Player leaves the destination volume

- **WHEN** the transitioned player exits the suppressed destination ENEX volume
- **THEN** suppression SHALL clear and a later re-entry MAY trigger normally

### Requirement: Overlapping ENEX candidates resolve deterministically

When more than one eligible ENEX volume contains the player, selection SHALL be deterministic.

#### Scenario: Two eligible ENEX volumes overlap

- **WHEN** the player is simultaneously inside two eligible ENEX bounds
- **THEN** repeated evaluation from the same state SHALL select the same entry according to a documented stable priority rule

### Requirement: Interior debugging is observable without being required for gameplay

Developer debug tooling SHALL be able to inspect active-area and ENEX state, but production transition behavior SHALL not depend on the debug UI.

#### Scenario: Debug view is enabled

- **WHEN** a developer enables the relevant browser debug controls
- **THEN** active area, nearby rotated ENEX footprints/vertical bounds, source kind (IPL or 2DFX), pairing, resolved teleport target/heading, eligibility, readiness, and suppression state SHALL be inspectable

#### Scenario: Debug view is disabled

- **WHEN** no debug overlay is mounted
- **THEN** ENEX parsing, streaming, collision, and transitions SHALL function identically

### Requirement: Real GTA interior behavior is validated end to end

The capability SHALL be considered complete only after browser validation demonstrates original GTA SA interior access with real assets/collision and validates that supported ENEX sources, including a real 2DFX type 6 case when present in the chosen installation/data set, are not silently omitted.

#### Scenario: Enter and exit a real interior

- **WHEN** a developer runs the game with a valid local GTA SA installation and uses a real ENEX
- **THEN** the correct interior SHALL be visually ready with its textures/meshes and collision before reveal/control, the player SHALL be able to move without falling through or spawning inside geometry, and the corresponding exit SHALL return the player to the correct GTA-resolved exterior location/heading
