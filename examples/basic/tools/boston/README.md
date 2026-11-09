# Boston sample data

How the polygon files of the Boston page are made. The same three files are
bundled by the React (`public/boston/`), Android (`example-app/src/main/assets/boston/`)
and iOS (`samples/MapConductorSampleApp/Resources/`) samples.

| File | What | Polygons | Unit |
| --- | --- | --- | --- |
| `boston-downtown.bin` | Downtown buildings in three nested areas, with height and name | 9,467 | 1e-6° |
| `boston-city-buildings.bin` | Every building in the city, with height | 105,599 | 1e-6° |
| `boston-city-parcels.bin` | Every parcel in the city, with its land use | 98,815 | 1e-5° |

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
python pack.py decode boston-city-parcels.bin     # counts and sizes
```

Each run reads the written file back and checks it against what it wrote.

- `fixture.py` prints the small files the three samples' decoding tests share
  (every field, at 1e-6 and at 1e-5).
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

## Attribution and licences

- Buildings (city and downtown): © OpenStreetMap contributors, Esri Community
  Maps contributors, USGS, Microsoft — via Overture Maps Foundation.
  [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- Parcels: City of Boston *Parcels 2025* (Analyze Boston),
  [ODC PDDL](https://opendatacommons.org/licenses/pddl/1-0/).
- Land use: City of Boston FY2026 Property Assessment (Analyze Boston),
  licensed PDDL like the parcels.
- City boundary: *City of Boston Boundary* (Analyze Boston). It only decides
  which buildings are kept; nothing of it is redistributed.

The samples show these attributions on the map.
