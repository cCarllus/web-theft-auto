# GTA Path Nodes

## Purpose

Define observable behavior for faithfully parsing, indexing, lazily loading, and exposing the original GTA San Andreas `nodes0.dat` through `nodes63.dat` path graph while preserving pedestrian and vehicle metadata for current and future navigation consumers.

## ADDED Requirements

### Requirement: Native GTA SA path files are parsed in original section order

The system SHALL parse the native little-endian GTA San Andreas `nodes*.dat` layout in the order authored by the game: header, path nodes, navi nodes, node links, filler, navi links, link lengths, intersection flags, and trailing/unknown data.

#### Scenario: Parse a complete synthetic path file

- **WHEN** a byte-exact synthetic buffer contains all native sections
- **THEN** the parser SHALL consume each section at the correct byte offset and return the corresponding typed records

#### Scenario: Parse a real GTA path file

- **WHEN** a real `nodes15.dat` fixture from a clean GTA SA installation is available
- **THEN** the parser SHALL successfully read its header, nodes, links, and metadata without reading beyond the buffer

### Requirement: Header counts are validated before section allocation

The path parser SHALL read the five 32-bit header counts and SHALL validate their relationships and required byte ranges before allocating or iterating section records.

#### Scenario: Valid header counts

- **WHEN** total node count equals the expected vehicle-plus-pedestrian count and all declared sections fit in the input
- **THEN** parsing SHALL proceed

#### Scenario: Truncated buffer

- **WHEN** header counts require more bytes than are present
- **THEN** parsing SHALL fail predictably instead of returning partially decoded arrays or reading out of bounds

#### Scenario: Implausible count arithmetic

- **WHEN** count arithmetic overflows, contradicts required node grouping, or exceeds the available buffer
- **THEN** parsing SHALL fail before large allocations are attempted

### Requirement: Vehicle and pedestrian path nodes remain distinguishable

The parsed path area SHALL preserve the authored ordering in which vehicle nodes precede pedestrian nodes and SHALL expose which kind each node belongs to.

#### Scenario: Header declares both node kinds

- **WHEN** a file declares V vehicle nodes and P pedestrian nodes
- **THEN** the first V parsed path nodes SHALL be identifiable as vehicle nodes and the following P SHALL be identifiable as pedestrian nodes

#### Scenario: Pedestrian-only consumer

- **WHEN** a consumer requests pedestrian nodes
- **THEN** it SHALL be able to access that subset without reparsing or discarding the stored vehicle nodes

### Requirement: Path node records preserve raw and decoded fields

Each 28-byte path node SHALL preserve the original raw fields and SHALL expose decoded position, identity, width, link range, flood-fill value, and flags.

#### Scenario: Decode fixed-point position

- **WHEN** a path node contains signed compressed X/Y/Z coordinates
- **THEN** its decoded world position SHALL equal the authored coordinates using GTA SA's fixed-point scale

#### Scenario: Preserve unused/runtime fields

- **WHEN** a node contains values in the two initial 32-bit fields or the 16-bit heuristic/runtime field
- **THEN** those values SHALL remain observable even if normal runtime navigation does not use them

#### Scenario: Preserve area and node identity

- **WHEN** a node declares an area ID and node ID
- **THEN** its `PathNodeId` SHALL preserve both values exactly

### Requirement: Path width is preserved without semantic loss

The parser SHALL preserve the raw path-width byte and SHALL make authored corridor width available to navigation consumers without destroying the original fixed-point value.

#### Scenario: Nonzero path width

- **WHEN** a node has a nonzero path-width byte
- **THEN** the parsed node SHALL expose the raw byte and a decoded usable width/radius consistent with GTA SA fixed-point semantics

#### Scenario: Zero path width

- **WHEN** a node has zero authored path width
- **THEN** the parsed value SHALL remain zero rather than being replaced with an invented default

### Requirement: On-disk path-node flags are decoded and preserved

The system SHALL preserve the full 32-bit node flags and SHALL expose validated native fields needed by navigation and future traffic behavior, including link count, traffic level, road-block metadata, water/boat, emergency-only, highway/not-highway, spawn probability, parking/behavior metadata, and remaining raw bits.

#### Scenario: Decode link count

- **WHEN** the low four flag bits encode N links
- **THEN** the node SHALL expose N as its authored link count

#### Scenario: Decode traffic level

- **WHEN** bits 4-5 contain a native traffic-level value
- **THEN** the node SHALL expose the corresponding four-level value without overwriting the raw flags

#### Scenario: Decode emergency-only

- **WHEN** the native emergency-only bit is set
- **THEN** the node SHALL expose that restriction to graph filters

#### Scenario: Preserve unknown bits

- **WHEN** a flag bit has no implemented semantic
- **THEN** the raw flags SHALL still retain it

### Requirement: Navi node records are parsed completely

Each 14-byte native navi-node/car-path-link record SHALL preserve its position, attached path-node address, direction, raw flags, width, lane counts, traffic-light metadata, crossing metadata, and unused bits.

#### Scenario: Decode navi position and direction

- **WHEN** a navi record contains compressed XY position and signed direction bytes
- **THEN** the parser SHALL expose the corresponding world position and normalized-direction representation

#### Scenario: Decode attached node

- **WHEN** a navi record references a target area and node
- **THEN** that path-node identity SHALL be preserved

#### Scenario: Preserve lane and traffic-light flags

- **WHEN** navi flag bits encode left/right lane counts and traffic-light behavior
- **THEN** each field SHALL be independently observable while the full raw flags remain available

### Requirement: Node links preserve cross-area addresses

Each normal node-link record SHALL preserve its target area ID and target node ID, including links that leave the current `nodes*.dat` area.

#### Scenario: Same-area link

- **WHEN** a link points to a node in the current area
- **THEN** the target identity SHALL resolve to that local node when available

#### Scenario: Cross-area link

- **WHEN** a link points to a different area
- **THEN** the target area/node identity SHALL remain intact and SHALL be resolvable after the target area is loaded

### Requirement: Link ranges are derived from authored node metadata

A node's neighbor range SHALL be determined from its base link ID and authored link count.

#### Scenario: Node with multiple links

- **WHEN** a node has base link ID L and link count N
- **THEN** its normal link records SHALL be the contiguous range `[L, L + N)`

#### Scenario: Invalid link range

- **WHEN** a node's declared range exceeds the normal link count
- **THEN** the parser/provider SHALL surface the data as invalid rather than reading unrelated filler or another section as links

### Requirement: Dynamic-link filler is handled as native reserved data

The parser SHALL account for the native 768-byte node-link filler region used for GTA SA dynamic-link reserve space and SHALL NOT expose those filler entries as authored normal graph edges.

#### Scenario: Native filler is present

- **WHEN** the parser reaches the section after normal 4-byte node links
- **THEN** it SHALL advance across the expected 768-byte native filler region before reading navi links

#### Scenario: Filler contains non-default bytes

- **WHEN** the filler differs from the common repeated pattern
- **THEN** parsing SHALL still preserve/skip it according to structural size rather than misclassifying it as normal links

### Requirement: Navi links are decoded from native packed addresses

The system SHALL parse each 16-bit navi link with its native 10-bit navi-node index and 6-bit area ID.

#### Scenario: Same-area navi link

- **WHEN** a packed navi link identifies a local navi node
- **THEN** the decoded result SHALL preserve the local area and navi index

#### Scenario: Cross-area navi link

- **WHEN** the upper six bits identify another area
- **THEN** the decoded navi-link target SHALL preserve that target area

### Requirement: Authored link lengths are associated with graph links

The parser SHALL expose the authored one-byte link length corresponding to each normal node link.

#### Scenario: Normal link has an authored length

- **WHEN** link index L has a link-length byte
- **THEN** the graph edge represented by normal link L SHALL expose that authored length

#### Scenario: Dynamic reserve lengths exist after normal links

- **WHEN** the native file contains reserved dynamic-link length bytes
- **THEN** those bytes SHALL NOT create extra normal graph edges

### Requirement: Intersection flags are associated with graph links

The system SHALL parse link intersection metadata and SHALL expose road-crossing and pedestrian-traffic-light flags while preserving remaining bits.

#### Scenario: Road crossing flag

- **WHEN** a link's intersection byte marks a road crossing
- **THEN** the corresponding link metadata SHALL expose that fact

#### Scenario: Pedestrian traffic-light flag

- **WHEN** a link's intersection byte marks pedestrian traffic-light behavior
- **THEN** the corresponding link metadata SHALL expose that fact

#### Scenario: Unknown intersection bits

- **WHEN** other bits are present
- **THEN** they SHALL remain observable in the raw intersection byte

### Requirement: Trailing and unknown bytes are not silently lost

The parsed path-area result SHALL retain structurally trailing/unknown native data, including the native reserved bytes after path-intersection flags.

#### Scenario: Native trailing reserve is present

- **WHEN** a standard GTA SA file contains its trailing reserved bytes
- **THEN** parsing SHALL consume/preserve them separately from normal graph data

#### Scenario: Additional trailing bytes are present

- **WHEN** bytes remain after all known native sections
- **THEN** the parser SHALL make that trailing data observable or explicitly diagnose it rather than silently treating it as path nodes

### Requirement: The outdoor path map uses the original 64-area spatial layout

The path-area layer SHALL support the 8x8 GTA SA outdoor path grid, 750 world units per area, beginning at (-3000, -3000) and using row-major area IDs 0 through 63.

#### Scenario: Position lies in a single path area

- **WHEN** a world position is inside one 750x750 region
- **THEN** the spatial lookup SHALL return the corresponding row-major area ID

#### Scenario: Radius crosses an area boundary

- **WHEN** a position/radius query overlaps adjacent path regions
- **THEN** the spatial lookup SHALL include every touched valid area rather than only the center area

#### Scenario: Query reaches world-grid edge

- **WHEN** a radius extends beyond the 8x8 native path grid
- **THEN** only valid native area IDs SHALL be returned

### Requirement: Path areas are loaded lazily from the existing VFS

The path graph SHALL load `nodes{area}.dat` only when an area is requested and SHALL use the copies already present in the VFS through the existing `.dat` asset selection.

#### Scenario: Game boots without a path query

- **WHEN** no consumer requests path areas
- **THEN** the runtime SHALL NOT be required to parse all 64 path files

#### Scenario: First query requests area 15

- **WHEN** area 15 is first needed
- **THEN** `nodes15.dat` SHALL be loaded and parsed from the VFS

#### Scenario: Existing asset partition is used

- **WHEN** build/local asset selection encounters `nodes15.dat` in `gta3.img`
- **THEN** no duplicate path-specific extraction pipeline SHALL be required for normal runtime use

### Requirement: Repeated and concurrent area loads are cached

The path-area store SHALL cache parsed areas and SHALL deduplicate concurrent requests for the same area.

#### Scenario: Area is requested twice after success

- **WHEN** the same area is requested again after being parsed
- **THEN** the cached parsed area SHALL be returned without reparsing its bytes

#### Scenario: Area is requested concurrently

- **WHEN** two consumers request an unloaded area before the first parse completes
- **THEN** only one underlying load/parse SHALL be required and both consumers SHALL observe the same completed area data

### Requirement: Cache ownership permits future eviction

The path-area API SHALL not require parsed areas to remain resident forever.

#### Scenario: Default session cache retains an area

- **WHEN** no eviction policy is configured
- **THEN** an already parsed area MAY remain cached for later queries

#### Scenario: Future eviction policy removes an area

- **WHEN** a later cache policy evicts a parsed area
- **THEN** the binary parser and public node identities SHALL not need to change for that policy to function

### Requirement: Nearest-node lookup is spatially bounded

Nearest-node lookup SHALL inspect only path areas touched by the configured search region and SHALL support filtering by node kind and flags.

#### Scenario: Find nearest pedestrian node

- **WHEN** a valid pedestrian node lies inside the requested radius
- **THEN** the lookup SHALL return the closest acceptable pedestrian node using deterministic tie-breaking

#### Scenario: Vehicle nodes are present closer than pedestrian nodes

- **WHEN** a pedestrian lookup encounters a closer vehicle node
- **THEN** that vehicle node SHALL NOT satisfy the pedestrian query

#### Scenario: No acceptable node is within radius

- **WHEN** all nearby nodes are filtered or outside the requested radius
- **THEN** lookup SHALL return an explicit not-found result rather than scanning the entire map for an arbitrarily distant node

### Requirement: Path data retains future traffic metadata

Even when the current consumer requests pedestrian navigation, vehicle/navi metadata required by future traffic systems SHALL remain present in parsed area data.

#### Scenario: Vehicle metadata is unused by pedestrian A-star

- **WHEN** a pedestrian path query runs
- **THEN** vehicle nodes, lane counts, water/highway flags, traffic level, spawn probability, parking behavior, navi links, and intersection metadata SHALL remain available to other consumers

### Requirement: Real GTA path fixture generation remains local

The test-fixture workflow SHALL be able to extract a real `nodes15.dat` into gitignored `tests/original/path/` from a clean local GTA SA installation without committing Rockstar path data.

#### Scenario: Generate real path fixtures

- **WHEN** `npm run test:fixtures` runs with a complete clean GTA SA source
- **THEN** it SHALL be able to produce `tests/original/path/nodes15.dat`

#### Scenario: Fixture source is absent

- **WHEN** the local GTA source is unavailable
- **THEN** absence of the real path fixture SHALL be treated as missing local test data rather than evidence that the path parser implementation is broken

### Requirement: Path graph debugging is observational

Developer tooling SHALL be able to inspect nearby pedestrian nodes and links without being required by the parser or path-area store.

#### Scenario: Debug node visualization is enabled

- **WHEN** a developer enables path debug drawing
- **THEN** nearby node identities, positions, links, cross-area targets, widths, and relevant flags SHALL be inspectable

#### Scenario: Debug tooling is disabled

- **WHEN** no path visualization is active
- **THEN** parsing, lazy loading, caching, and graph queries SHALL behave identically
