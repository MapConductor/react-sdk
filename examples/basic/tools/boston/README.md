# Boston sample data

How the polygon files of the Boston page, the polyline file of the Boston
roads page and the circle file of the Boston trees page are made. The same five files are bundled by the React
(`public/boston/`), Android (`example-app/src/main/assets/boston/`) and iOS
(`samples/MapConductorSampleApp/Resources/`) samples.

| File | What | Polygons | Unit |
| --- | --- | --- | --- |
| `boston-downtown.bin` | Downtown buildings in three nested areas, with height and name | 9,467 | 1e-6° |
| `boston-city-buildings.bin` | Every building in the city, with height | 105,599 | 1e-6° |
| `boston-city-parcels.bin` | Every parcel in the city, with its land use | 98,815 | 1e-5° |
| `boston-city-roads.bin` | Every road in the city (polylines), with its class and name | 54,645 | 1e-5° |
| `boston-city-trees.bin` | Every street and park tree the city keeps (circles: the estimated crown), with its group | 52,028 | 1e-5° |

## Sources

- **Buildings**: Overture Maps Foundation, `buildings/building`, release
  `2026-10-21.0`, in the city's bounding box:

  ```sh
  pip install overturemaps
  overturemaps download -r 2026-10-21.0 -t building -f geojson \
    --bbox=-71.19125,42.22792,-70.86865,42.39699 -o boston-city-bbox.geojson
  ```

- **City boundary** (water included): *City of Boston Boundary* from Analyze
  Boston, as GeoJSON. Only the buildings use it: a building is kept when its
  centroid is inside. None of its geometry is in the files, and the parcels
  command takes it but does not use it.
- **Parcels**: *Parcels 2025* from Analyze Boston (https://data.boston.gov/), as
  GeoJSON (`Parcels_2025.geojson` in the zip).
- **Land use**: *City of Boston FY2026 Property Assessment* from Analyze Boston,
  as CSV. Only the `LU` code is read, joined to the parcels on `GIS_ID`;
  nothing else (owner names, values) is carried over.
- **Roads**: Overture Maps Foundation, `transportation/segment`, release
  `2026-10-21.0`, in the same bounding box. Only the `road` subtype is read
  (rail and water lines are left out), cut at the city boundary:

  ```sh
  overturemaps download -r 2026-10-21.0 -t segment -f geojson \
    --bbox=-71.19125,42.22792,-70.86865,42.39699 -o boston-segments-bbox.geojson
  ```

  Overture rather than the city's *Boston Street Segments* (Analyze Boston):
  the page colours and sizes the lines by Overture's one `class` scale
  (motorway … footway), which takes in the footways, paths and service roads
  as well as the streets, and the buildings already come from the same
  release and licence.
- **Trees**: *BPRD Trees* from Analyze Boston (Boston Parks and Recreation
  Department's tree inventory), as CSV (`bprd_trees.csv`, about 12 MB, 55,227
  rows):

  ```sh
  curl -L -o bprd_trees.csv \
    https://data.boston.gov/dataset/e4c76e72-dcf1-40a0-b426-97c52214a9fe/resource/995cd80f-2489-41bf-b16b-113dba4f2797/download/bprd_trees.csv
  ```

  Only the position, the botanical name's genus and the trunk diameter (`dbh`,
  inches; `dbh_range` when `dbh` is empty) are read. Trees rather than
  hydrants or bus stops: a tree's crown is a circle whose radius means
  something on the ground and differs from tree to tree (1 m to 15 m here), so
  the page shows circles keeping their size on the ground as the map zooms,
  and tens of thousands of them overlap in the dense streets.
- **Downtown**: the Overture extract the sample used to hold as JSON
  (`public/boston/boston-buildings.json` up to commit `daeb4e5`):

  ```sh
  git show daeb4e5:examples/basic/public/boston/boston-buildings.json > boston-buildings.json
  ```

The source files (about 200 MB of GeoJSON and an 80 MB CSV) are not committed.

## Building the files

Python 3 with `shapely` (2.x) for the parcels and buildings; the rest is the
standard library.

```sh
pip install shapely
python pack.py downtown  boston-buildings.json boston-downtown.bin
python pack.py buildings boston-city-bbox.geojson boston-boundary.geojson boston-city-buildings.bin
python pack.py parcels   Parcels_2025.geojson boston-boundary.geojson boston-city-parcels.bin \
  fy2026-property-assessment.csv
python pack.py roads     boston-segments-bbox.geojson boston-boundary.geojson boston-city-roads.bin
python pack.py trees     bprd_trees.csv boston-city-trees.bin
python pack.py decode boston-city-parcels.bin     # counts and sizes
```

Each run reads the written file back and checks it against what it wrote.

- `fixture.py` prints the small files the three samples' decoding tests share
  (every polygon field, at 1e-6 and at 1e-5, two road polylines and two tree
  circles).
- `compare_v1_v2.py` checks that a v1 and a v2 file of the buildings hold the
  same shapes, heights and land uses (`pack.py --format v1` still writes v1).

## Format: MCPG v2

Described at the top of `pack.py` and of each sample's reader
(`bostonData.ts`, `BostonData.kt`, `BostonData.swift`). In short: a header
`'MCPG' u32 version=2 u32 count u8 fields u8 digits`, then per polygon the
fields the file carries (height, land use, area, name) and the rings as
zigzag-varint differences of integer coordinates in 10^-digits degree, without
the closing vertex. There are no ids: a polygon's id on the map is its index in
the file.

The roads use the same format with two more header bits: 16, a road class
(`u8`, after the name), and 32, *lines*: each record's "ring" is then an open
polyline, every vertex stored (at least two) and not closed by the reader.
Each road record holds one polyline. Classes, grouped from Overture's:

| Code | Class | Overture classes |
| --- | --- | --- |
| 0 | highway | motorway, trunk |
| 1 | primary | primary |
| 2 | secondary | secondary |
| 3 | tertiary | tertiary |
| 4 | local | residential, unclassified, living_street, unknown |
| 5 | service | service |
| 6 | path | footway, path, steps, cycleway, pedestrian, track, bridleway |

The trees use two more header bits: 64, *circles*: a record is then one
circle, `varint radius` (0.1 m, at least 1) and its centre as one more
`svarint dLat, svarint dLng` of the difference series, with no ring count; and
128, a tree group (`u8`, after the road class's place). The records are in
Hilbert-curve order of their centres, so the differences stay small (the
file is about 4 bytes a tree). Groups, by genus:

| Code | Group | Genera |
| --- | --- | --- |
| 0 | maple | Acer |
| 1 | oak | Quercus |
| 2 | honeylocust | Gleditsia |
| 3 | linden | Tilia |
| 4 | elm | Ulmus |
| 5 | flowering | Prunus, Pyrus, Malus, Syringa, Amelanchier, Cercis, Crataegus, Cornus, Magnolia and other flowering genera (see `TREE_GROUP` in `pack.py`) |
| 6 | conifer | Pinus, Picea, Abies, Tsuga, Thuja, Taxus, Juniperus, Larix, Metasequoia, Taxodium, ... |
| 7 | other | every other genus (Fraxinus, Zelkova, Platanus, Ginkgo, ...) |

## What is left out

- **Buildings and downtown**: nothing. Every vertex, at 1e-6°.
- **Parcels**: coordinates are rounded to 1e-5° (about 1 m), repeated points
  are dropped, and so are the vertices that lie almost on a straight line: a
  vertex goes when it, and every vertex dropped since the last kept one, is
  less than **0.5 m** (on the ground) from the segment between the last kept
  vertex and the next one. Every original vertex stays within 0.5 m of the
  simplified outline, on top of the rounding (at most about 1.2 m from the
  original 1e-6 vertex in all). A ring left with fewer than three vertices is
  dropped, and a polygon goes with its outline: 28 of the 98,843 parcel
  polygons (slivers, most under 10 m²) and one 3-vertex hole.
  - When dropping vertices makes a polygon invalid where the rounded one was
    not, the polygon keeps every rounded vertex (4 polygons).
  - Holes must stay apart: the SDKs union holes that touch or overlap, which is
    slow and has filled whole blocks of a street polygon. Rounding snapped
    holes together in 10 street polygons; a vertex that lies on another hole
    moves by 1e-5° (about 1 m) into its own hole until they are apart.

  Vertices (closing ones not counted) go from 1,337,673 to 672,205 and the file
  from 4.0 MB (gzip 3.0 MB) to 1.9 MB (gzip 1.4 MB).

- **Roads**: coordinates are rounded to 1e-5° and the vertices that lie
  almost on a straight line are dropped, as for the parcels (0.5 m on the
  ground), except that both ends of a polyline always stay. 43 segments that
  became a single point inside the city are dropped. Names are Overture's
  primary name only. Vertices go from 362,585 to 234,765; the file is 1.02 MB
  (gzip 0.60 MB).

- **Trees**: sites with nothing standing (empty pits, scheduled planting
  sites, retired sites, stumps: 3,199 rows) are left out, and so is
  everything but the position, the genus and the trunk diameter (no ids,
  species, addresses or dates). Positions are rounded to 1e-5° (about 1 m).
  The radius is an **estimate of the crown**, not a measurement (the inventory
  has no crown widths): the trunk diameter times 22 (crowns of open-grown
  broadleaf trees are commonly some 20-25 times as wide as the trunk), halved,
  between 1 m and 15 m, to 0.1 m. 15,969 small trees get the 1 m floor, 77
  large ones the 15 m cap; the median is 2.0 m. The file is 0.21 MB (gzip
  0.16 MB).

## Attribution and licences

- Buildings (city and downtown): © OpenStreetMap contributors, Esri Community
  Maps contributors, USGS, Microsoft — via Overture Maps Foundation.
  [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- Roads: © OpenStreetMap contributors, TomTom — via Overture Maps
  Foundation (transportation theme).
  [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- Parcels: City of Boston *Parcels 2025* (Analyze Boston),
  [ODC PDDL](https://opendatacommons.org/licenses/pddl/1-0/).
- Land use: City of Boston FY2026 Property Assessment (Analyze Boston),
  licensed PDDL like the parcels.
- Trees: City of Boston *BPRD Trees* (Analyze Boston),
  [ODC PDDL](https://opendatacommons.org/licenses/pddl/1-0/).
- City boundary: *City of Boston Boundary* (Analyze Boston). It only decides
  which buildings are kept and where the roads are cut; nothing of it is
  redistributed.

The samples show these attributions on the map.
