# Packs the Boston sample's polygons into MCPG files (see README.md in this folder).
#
#   python pack.py [--format v1|v2] parcels   <Parcels_2025.geojson> <boundary.geojson> <out.bin> [<assessment.csv>]
#   python pack.py [--format v1|v2] buildings <overture.geojson>     <boundary.geojson> <out.bin>
#   python pack.py [--format v2]    downtown  <boston-buildings.json> <out.bin>
#   python pack.py                  roads     <overture-segments.geojson> <boundary.geojson> <out.bin>
#   python pack.py                  trees     <bprd_trees.csv> <out.bin>
#   python pack.py decode <in.bin>            (reads v1 or v2 and prints counts and sizes)
#
# v2 is the default and the only format the samples read.
#
# v1 (with ids; kept to compare against, cannot hold downtown):
#   'MCPG' u32 version=1 u32 count
#   per polygon: u8 labelLen, label (UTF-8), u16 height (0.1 m, 0xFFFF = unknown),
#                u16 ringCount, per ring: u32 n, n x (i32 dLat, i32 dLng)
#   Coordinates are 1e-6 degree integers: one difference series across the whole
#   file (a ring's first vertex is relative to the previous ring's last).
#   Little-endian. A building's label is its Overture id, a parcel's "<GIS_ID>|<land use>".
#
# v2 (no ids):
#   'MCPG' u32 version=2 u32 count u8 fields u8 digits   (little-endian)
#     fields: 1 = height, 2 = land use, 4 = area, 8 = name, 16 = road class, 128 = tree group
#             (what the file carries),
#             32 = lines: the shapes are polylines, not polygons (see below),
#             64 = circles: each record is one circle, a radius and a centre (see below)
#     digits: coordinates are integers of 10^-digits degree (6 = 1e-6, 5 = 1e-5)
#   per polygon, only the fields present, in this order:
#     height    varint  0 = unknown, else the height in 0.1 m plus 1
#     land use  u8      0 family, 1 apartment, 2 condo, 3 mixed, 4 commercial,
#                       5 industrial, 6 exempt, 7 vacant, 8 unknown
#     area      u8      the smallest downtown area (0, 1 or 2) the building fits in
#     name      varint  byte length (0 = none), UTF-8
#     road class u8     0 highway (motorway, trunk), 1 primary, 2 secondary, 3 tertiary,
#                       4 local (residential, unclassified, living street, unknown),
#                       5 service, 6 path (footway, path, steps, cycleway, pedestrian, track)
#     tree group u8     0 maple, 1 oak, 2 honeylocust, 3 linden, 4 elm, 5 flowering,
#                       6 conifer, 7 other (see TREE_GROUP)
#     varint ringCount, per ring: varint n, n x (svarint dLat, svarint dLng)
#     -- or, with the circles bit (64), instead of the rings:
#     varint radius (0.1 m, at least 1), svarint dLat, svarint dLng (the centre)
#   varint is LEB128 (7 bits at a time, low first); svarint is a zigzag varint
#   ((v << 1) ^ (v >> 63)). Coordinates are one difference series across the
#   file, as in v1. A ring's closing vertex (the same as its first) is not
#   stored: n counts the others and the reader closes the ring again.
#   With the lines bit (32) a "ring" is an open polyline instead: every vertex
#   is stored (n >= 2) and the reader does not close it. The roads file has one
#   polyline per record (ringCount 1); each is one polyline on the map.
#   With the circles bit (64) a record is one circle: its radius on the ground and
#   its centre, the centre being one more point of the file's difference series.
#   The trees file is written in Hilbert-curve order of the centres, so the
#   differences stay small (mostly one or two bytes each).
#
# Trees are the City of Boston's street and park trees (BPRD Trees, Analyze
# Boston). A record is a tree's estimated crown: its radius is the trunk
# diameter (DBH) times CROWN_TO_DBH / 2 -- crowns of open-grown broadleaf trees
# are commonly some 20-25 times as wide as the trunk -- between TREE_MIN_RADIUS_M
# and TREE_MAX_RADIUS_M. An estimate, not a measurement: the inventory holds no
# crown widths. Planting sites, empty pits, stumps and retired sites are left out.
#
# Buildings keep 1e-6 and every vertex. Parcels and roads are written at 1e-5
# (about 1 m) and lose the vertices that lie almost on a straight line (see
# simplify_ring, simplify_path).
#
# Roads are Overture transportation segments of the road subtype, cut at the
# city boundary (a segment crossing it keeps the part inside, a segment leaving
# and coming back becomes several polylines). They keep their class (grouped as
# above) and primary name, and nothing else (no ids, connectors or rules).
#
# Buildings are kept when their centroid is inside the city boundary (water
# included). Every parcel is in the city. Parcels get a land use from the
# Property Assessment, joined on GIS_ID; only the land use code is read from it
# (no owner names or values). Downtown is built from the Overture extract the
# repository used to hold (JSON: id, l, h, n, rings); v2 drops the ids and keeps
# the nested area (l), the height (h) and the name (n).
import csv, gzip, json, math, struct, sys

FIELD_HEIGHT, FIELD_USE, FIELD_AREA, FIELD_NAME, FIELD_CLASS, FIELD_LINES = 1, 2, 4, 8, 16, 32
FIELD_CIRCLES, FIELD_TREE = 64, 128
TREE_GROUPS = ['maple', 'oak', 'honeylocust', 'linden', 'elm', 'flowering', 'conifer', 'other']
# Genus (first word of spp_bot) -> the sample's tree group; any other genus is 'other'
TREE_GROUP = {
    'Acer': 'maple', 'Quercus': 'oak', 'Gleditsia': 'honeylocust', 'Tilia': 'linden', 'Ulmus': 'elm',
    'Prunus': 'flowering', 'Pyrus': 'flowering', 'Malus': 'flowering', 'Syringa': 'flowering',
    'Amelanchier': 'flowering', 'Cercis': 'flowering', 'Crataegus': 'flowering', 'Cornus': 'flowering',
    'Magnolia': 'flowering', 'Chionanthus': 'flowering', 'Halesia': 'flowering', 'Styrax': 'flowering',
    'Hamamelis': 'flowering', 'Hydrangea': 'flowering', 'Hibiscus': 'flowering', 'Viburnum': 'flowering',
    'Laburnum': 'flowering', 'Stewartia': 'flowering', 'Oxydendrum': 'flowering', 'Albizia': 'flowering',
    'Pinus': 'conifer', 'Picea': 'conifer', 'Abies': 'conifer', 'Tsuga': 'conifer', 'Thuja': 'conifer',
    'Taxus': 'conifer', 'Juniperus': 'conifer', 'Larix': 'conifer', 'Metasequoia': 'conifer',
    'Taxodium': 'conifer', 'Platycladus': 'conifer', 'Chamaecyparis': 'conifer', 'Cryptomeria': 'conifer',
    'Pseudotsuga': 'conifer', 'Cedrus': 'conifer', 'Sequoiadendron': 'conifer', 'Ginkgo': 'other',
}
# Not trees: sites in the inventory with nothing standing
TREE_SKIP = {'Empty', 'Scheduled', 'Vacant', 'Stump', '--', ''}
# Crown diameter / trunk diameter, and the radius bounds (metres on the ground)
CROWN_TO_DBH = 22
TREE_MIN_RADIUS_M = 1.0
TREE_MAX_RADIUS_M = 15.0
# DBH (inches) for a tree with none recorded, from its dbh_range when there is one
DBH_RANGE_MID = {'0-3in': 2, '3-6in': 4.5, '6-12in': 9, '12-18in': 15, '18-24in': 21, '24-30in': 27, '>30in': 33}
TREE_DIGITS = 5
ROAD_CLASSES = ['highway', 'primary', 'secondary', 'tertiary', 'local', 'service', 'path']
# Overture segment class -> the sample's road class
ROAD_CLASS = {
    'motorway': 'highway', 'trunk': 'highway',
    'primary': 'primary', 'secondary': 'secondary', 'tertiary': 'tertiary',
    'residential': 'local', 'unclassified': 'local', 'living_street': 'local', 'unknown': 'local',
    'service': 'service',
    'footway': 'path', 'path': 'path', 'steps': 'path', 'cycleway': 'path', 'pedestrian': 'path',
    'track': 'path', 'bridleway': 'path',
}
USES = ['family', 'apartment', 'condo', 'mixed', 'commercial', 'industrial', 'exempt', 'vacant', 'unknown']

# Parcels: 1e-5 degree, and drop a vertex when every vertex dropped since the
# last kept one is closer than this to the segment from that kept vertex to the
# next one (metres on the ground).
PARCEL_DIGITS = 5
PARCEL_TOLERANCE_M = 0.5
# Roads: the same unit and tolerance as the parcels.
ROAD_DIGITS = 5
ROAD_TOLERANCE_M = 0.5

# Land use code (LU) -> the sample's colour groups
LAND_USE = {
    'R1': 'family', 'R2': 'family', 'R3': 'family',
    'R4': 'apartment', 'A': 'apartment',
    'CM': 'condo', 'CD': 'condo', 'CP': 'condo',
    'RC': 'mixed',
    'C': 'commercial', 'CC': 'commercial',
    'I': 'industrial',
    'E': 'exempt', 'EA': 'exempt',
    'RL': 'vacant', 'CL': 'vacant', 'AH': 'vacant',
}
# When a parcel has several rows (condominium units and so on), which one wins
PRIORITY = ['condo', 'mixed', 'apartment', 'family', 'commercial', 'industrial', 'exempt', 'vacant']


class Poly:
    """One polygon. rings are [(ilat, ilng), ...] (integers of the file's unit, closed)."""

    def __init__(self, rings, label='', height=None, use=None, area=None, name=None, road=None, tree=None,
                 radius=None):
        self.rings, self.label, self.height, self.use, self.area, self.name = rings, label, height, use, area, name
        self.road = road
        # Circles: tree group, and radius in 0.1 m; rings is then [[(lat, lng)]], the centre.
        self.tree, self.radius = tree, radius


def to_int_ring(ring, digits=6):
    scale = 10 ** digits
    return [(round(lat * scale), round(lng * scale)) for lng, lat in ring]


def height10(h):
    """Height (m) -> 0.1 m units (capped at 0xFFFE to fit v1's u16). None is unknown."""
    return None if not h else min(0xFFFE, int(round(h * 10)))


def read_sources(kind, src, boundary_path, assessment=None, digits=6):
    from shapely.geometry import shape
    from shapely.prepared import prep
    from shapely.ops import unary_union

    land_use = {}
    if kind == 'parcels' and assessment:
        for row in csv.DictReader(open(assessment, encoding='utf-8-sig')):
            code = row['LU'].split(' ')[0].strip()
            cat = LAND_USE.get(code)
            gid = row['GIS_ID'].strip()
            if cat and (gid not in land_use or PRIORITY.index(cat) < PRIORITY.index(land_use[gid])):
                land_use[gid] = cat
    boundary = prep(unary_union([shape(f['geometry']) for f in json.load(open(boundary_path))['features']]))
    doc = json.load(open(src))
    polys = []
    for f in doc['features']:
        g = f['geometry']
        if not g:
            continue
        p = f['properties']
        if kind == 'buildings':
            if not boundary.contains(shape(g).centroid):
                continue
            label = (f.get('id') or p.get('id') or '')[:36]
            height, use = height10(p.get('height')), None
        else:
            label = str(p.get('MAP_PAR_ID') or p.get('LOC_ID') or '')
            height, use = None, None
            if land_use:
                use = land_use.get(label.strip(), 'unknown')
                label = f'{label}|{use}'
        parts = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for rings in parts:
            polys.append(Poly([to_int_ring(r, digits) for r in rings], label, height, use))
    return polys


def read_downtown(src):
    doc = json.load(open(src))
    polys = []
    for b in doc['buildings']:
        rings = [[(round(r[i + 1] * 1e6), round(r[i] * 1e6)) for i in range(0, len(r), 2)] for r in b['rings']]
        polys.append(Poly(rings, b['id'], height10(b['h']), None, b['l'], b.get('n')))
    return polys


def read_roads(src, boundary_path, digits):
    """Road segments cut at the city boundary: one Poly per polyline, its one "ring" open."""
    from shapely.geometry import shape
    from shapely.prepared import prep
    from shapely.ops import unary_union
    boundary = unary_union([shape(f['geometry']) for f in json.load(open(boundary_path))['features']])
    inside = prep(boundary)
    lines = []
    for f in json.load(open(src))['features']:
        p = f['properties']
        if p.get('subtype') != 'road' or not f['geometry']:
            continue
        cls = ROAD_CLASS.get(p.get('class') or 'unknown')
        if cls is None:
            raise ValueError(f"road class {p.get('class')!r} has no group")
        g = shape(f['geometry'])
        if not inside.intersects(g):
            continue
        if not inside.contains(g):
            g = g.intersection(boundary)
        parts = [g] if g.geom_type == 'LineString' else [x for x in getattr(g, 'geoms', []) if x.geom_type == 'LineString']
        name = ((p.get('names') or {}).get('primary') or None)
        for part in parts:
            if part.length == 0:
                continue
            lines.append(Poly([to_int_ring(part.coords, digits)], name=name, road=cls))
    return lines


def hilbert_d(n, x, y):
    """Distance along a Hilbert curve over an n x n grid (n a power of two)."""
    d = 0
    s = n // 2
    while s > 0:
        rx = 1 if x & s else 0
        ry = 1 if y & s else 0
        d += s * s * ((3 * rx) ^ ry)
        if ry == 0:
            if rx == 1:
                x, y = n - 1 - x, n - 1 - y
            x, y = y, x
        s //= 2
    return d


def read_trees(src, digits):
    """BPRD trees as circles (crown estimates), in Hilbert order of their centres. Returns (polys, stats)."""
    scale = 10 ** digits
    stats = {'rows': 0, 'skipped_sites': 0, 'no_dbh': 0, 'clamped_min': 0, 'clamped_max': 0}
    trees = []
    for row in csv.DictReader(open(src, encoding='utf-8-sig')):
        stats['rows'] += 1
        genus = (row['spp_bot'] or '').split(' ')[0]
        if genus in TREE_SKIP or not row['y_latitude'] or not row['x_longitude']:
            stats['skipped_sites'] += 1
            continue
        dbh = float(row['dbh'] or 0)
        if dbh <= 0:
            stats['no_dbh'] += 1
            dbh = DBH_RANGE_MID.get(row['dbh_range'], 0)
        radius_m = dbh * 0.0254 * CROWN_TO_DBH / 2
        if radius_m < TREE_MIN_RADIUS_M:
            stats['clamped_min'] += 1
            radius_m = TREE_MIN_RADIUS_M
        elif radius_m > TREE_MAX_RADIUS_M:
            stats['clamped_max'] += 1
            radius_m = TREE_MAX_RADIUS_M
        lat, lng = round(float(row['y_latitude']) * scale), round(float(row['x_longitude']) * scale)
        trees.append(Poly([[(lat, lng)]], tree=TREE_GROUP.get(genus, 'other'), radius=int(round(radius_m * 10))))
    min_lat = min(p.rings[0][0][0] for p in trees)
    min_lng = min(p.rings[0][0][1] for p in trees)
    n = 1 << 16
    span = max(max(p.rings[0][0][0] for p in trees) - min_lat, max(p.rings[0][0][1] for p in trees) - min_lng) + 1
    trees.sort(key=lambda p: hilbert_d(n, (p.rings[0][0][1] - min_lng) * (n - 1) // span,
                                       (p.rings[0][0][0] - min_lat) * (n - 1) // span))
    stats['trees'] = len(trees)
    return trees, stats


def simplify_path(path, digits, tolerance_m):
    """simplify_ring for an open polyline: both ends are kept. None if one point is left."""
    scale = 10 ** digits
    pts = []
    for q in path:
        if not pts or q != pts[-1]:
            pts.append(q)
    if len(pts) < 2:
        return None
    kept = [pts[0]]
    dropped = []
    for i in range(1, len(pts) - 1):
        candidate = dropped + [pts[i]]
        if all(_segment_distance_m(q, kept[-1], pts[i + 1], scale) < tolerance_m for q in candidate):
            dropped = candidate
        else:
            kept.append(pts[i])
            dropped = []
    kept.append(pts[-1])
    return kept


def simplify_roads(lines, digits, tolerance_m):
    stats = {'lines_in': len(lines), 'dropped_lines': 0, 'vertices_in': 0, 'vertices_out': 0}
    out = []
    for p in lines:
        stats['vertices_in'] += len(p.rings[0])
        path = simplify_path(p.rings[0], digits, tolerance_m)
        if path is None:
            stats['dropped_lines'] += 1
            continue
        p.rings = [path]
        stats['vertices_out'] += len(path)
        out.append(p)
    lines[:] = out
    stats['lines_out'] = len(out)
    return stats


def _segment_distance_m(p, a, b, scale):
    """Ground distance (m) from p to the segment a-b; points are (ilat, ilng) of 1/scale degree."""
    lat0 = math.radians(a[0] / scale)
    ky = 6371008.8 * math.pi / 180 / scale
    kx = ky * math.cos(lat0)
    px, py = (p[1] - a[1]) * kx, (p[0] - a[0]) * ky
    bx, by = (b[1] - a[1]) * kx, (b[0] - a[0]) * ky
    length2 = bx * bx + by * by
    t = 0.0 if length2 == 0 else max(0.0, min(1.0, (px * bx + py * by) / length2))
    return math.hypot(px - t * bx, py - t * by)


def simplify_ring(ring, digits, tolerance_m):
    """Drops repeated points, then the vertices that lie almost on a straight line.

    ring is closed (last == first). Walking the ring, a vertex is dropped when it
    and every vertex dropped since the last kept one are within tolerance_m of
    the segment from that kept vertex to the next vertex, so every original
    vertex stays within tolerance_m of the simplified outline. Measured against
    a segment (not the infinite line), so a spike is not dropped. The first
    vertex is always kept. Returns the closed ring, or None if fewer than three
    vertices are left.
    """
    scale = 10 ** digits
    closed = _dedupe_ring(ring)
    if closed is None:
        return None
    pts = closed[:-1]
    kept = [pts[0]]
    dropped = []
    n = len(pts)
    for i in range(1, n):
        nxt = pts[(i + 1) % n]
        candidate = dropped + [pts[i]]
        if all(_segment_distance_m(q, kept[-1], nxt, scale) < tolerance_m for q in candidate):
            dropped = candidate
        else:
            kept.append(pts[i])
            dropped = []
    if len(kept) < 3:
        return None
    return kept + [kept[0]]


def _dedupe_ring(ring):
    """The ring without repeated points (closed), or None if fewer than three are left."""
    pts = []
    for q in ring[:-1]:
        if not pts or q != pts[-1]:
            pts.append(q)
    while len(pts) > 1 and pts[-1] == pts[0]:
        pts.pop()
    return pts + [pts[0]] if len(pts) >= 3 else None


def _holes_apart(rings):
    """Whether no two holes cross, touch or contain one another.

    The SDKs union holes that do (PolygonUnion / PolygonHoleUnion), which is slow
    for a street polygon with a hundred holes and has filled whole blocks."""
    from shapely.geometry import Polygon
    from shapely.strtree import STRtree
    holes = [Polygon([(x, y) for y, x in r]) for r in rings[1:]]
    if len(holes) < 2:
        return True
    tree = STRtree(holes)
    return all(j <= i or not h.intersects(holes[j]) for i, h in enumerate(holes) for j in tree.query(h))


def _separate_holes(rings, passes=20):
    """Moves apart holes that rounding made touch or overlap.

    A vertex of one hole that lies on or in another hole moves by one unit
    (1e-5 degree, about 1 m) on one or both axes, trying first the direction
    nearest the inward normal of its own hole. A move is kept only when the two
    holes then overlap less and the moved hole stays as valid as it was. The
    street polygon around the holes stays one polygon with its holes apart.
    Returns new rings."""
    from shapely.geometry import Point, Polygon
    from shapely.strtree import STRtree
    rings = [list(r) for r in rings]
    poly = lambda r: Polygon([(x, y) for y, x in r])
    steps = [(dy, dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]

    def overlap(r1, r2):
        g = poly(r1).buffer(0).intersection(poly(r2).buffer(0))
        return (g.area, g.length, not g.is_empty)

    def try_move(i, j):
        """Moves one vertex of hole i (or of hole j) off the other; whether it did."""
        before = overlap(rings[i + 1], rings[j + 1])
        for a, b in ((i, j), (j, i)):
            ring, other = rings[a + 1], poly(rings[b + 1])
            valid = poly(ring).is_valid
            pts = ring[:-1]
            n = len(pts)
            turn = 1 if sum(pts[k][1] * pts[(k + 1) % n][0] - pts[(k + 1) % n][1] * pts[k][0] for k in range(n)) > 0 else -1
            for k, (y, x) in enumerate(pts):
                if other.distance(Point(x, y)) >= 0.5:
                    continue
                (py, px), (ny, nx) = pts[k - 1], pts[(k + 1) % n]
                nxv, nyv = -(ny - py) * turn, (nx - px) * turn
                for dy, dx in sorted(steps, key=lambda d: -(d[1] * nxv + d[0] * nyv)):
                    moved = pts[:k] + [(y + dy, x + dx)] + pts[k + 1:]
                    moved = moved + [moved[0]]
                    if valid and not poly(moved).is_valid:
                        continue
                    trial = (moved, rings[b + 1]) if a == i else (rings[i + 1], moved)
                    if overlap(*trial) < before:
                        rings[a + 1] = moved
                        return True
        return False

    for _ in range(passes):
        holes = [poly(r) for r in rings[1:]]
        tree = STRtree(holes)
        pairs = [(i, j) for i, h in enumerate(holes) for j in tree.query(h) if j > i and h.intersects(holes[j])]
        if not pairs or not any([try_move(i, j) for i, j in pairs]):
            break
    return rings


def _valid(rings):
    from shapely.geometry import Polygon
    return Polygon([(x, y) for y, x in rings[0]], [[(x, y) for y, x in r] for r in rings[1:]]).is_valid


def _sound(rings):
    return _valid(rings) and _holes_apart(rings)


def simplify_parcels(polys, digits, tolerance_m):
    """Simplifies every polygon in place; returns counts.

    Rings left with fewer than three vertices are dropped, and a polygon goes
    with its outline. When dropping vertices makes a polygon unsound (invalid:
    a ring crossing itself, a hole crossing the outline; or two holes touching)
    where the rounded polygon was sound, the polygon keeps every rounded vertex
    instead. unsound_after_rounding counts the polygons that are unsound with
    every rounded vertex too; they are kept as simplified. Holes that still
    touch (rounding snapped them together) are moved apart (_separate_holes).
    """
    stats = {'polygons_in': len(polys), 'dropped_polygons': 0, 'dropped_holes': 0,
             'kept_unsimplified': 0, 'unsound_after_rounding': 0, 'holes_moved_apart': 0, 'holes_still_touching': 0, 'vertices_in': 0, 'vertices_out': 0}
    out = []
    for p in polys:
        stats['vertices_in'] += sum(len(r) for r in p.rings)
        rings = [simplify_ring(r, digits, tolerance_m) for r in p.rings]
        if rings[0] is None:
            stats['dropped_polygons'] += 1
            continue
        rings = [r for r in rings if r is not None]
        if tolerance_m > 0 and not _sound(rings):
            rounded = [r for r in (_dedupe_ring(r) for r in p.rings) if r is not None]
            if _sound(rounded):
                stats['kept_unsimplified'] += 1
                rings = rounded
            else:
                stats['unsound_after_rounding'] += 1
        if not _holes_apart(rings):
            rings = _separate_holes(rings)
            stats['holes_moved_apart'] += 1
            if not _holes_apart(rings):
                stats['holes_still_touching'] += 1
        stats['dropped_holes'] += len(p.rings) - len(rings)
        p.rings = rings
        stats['vertices_out'] += sum(len(r) for r in p.rings)
        out.append(p)
    polys[:] = out
    stats['polygons_out'] = len(out)
    return stats


def write_v1(polys):
    buf = bytearray(b'MCPG') + struct.pack('<II', 1, len(polys))
    plat = plng = 0
    for p in polys:
        lb = p.label.encode('utf-8')[:255]
        buf += struct.pack('<B', len(lb)) + lb
        buf += struct.pack('<HH', 0xFFFF if p.height is None else p.height, len(p.rings))
        for ring in p.rings:
            buf += struct.pack('<I', len(ring))
            for lat, lng in ring:
                buf += struct.pack('<ii', lat - plat, lng - plng)
                plat, plng = lat, lng
    return buf


def varint(v, out):
    while v >= 0x80:
        out.append((v & 0x7F) | 0x80)
        v >>= 7
    out.append(v)


def svarint(v, out):
    varint((v << 1) ^ (v >> 63), out)


def write_v2(polys, fields, digits=6):
    buf = bytearray(b'MCPG') + struct.pack('<IIBB', 2, len(polys), fields, digits)
    plat = plng = 0
    for p in polys:
        if fields & FIELD_HEIGHT:
            varint(0 if p.height is None else p.height + 1, buf)
        if fields & FIELD_USE:
            buf.append(USES.index(p.use or 'unknown'))
        if fields & FIELD_AREA:
            buf.append(p.area)
        if fields & FIELD_NAME:
            name = (p.name or '').encode('utf-8')
            varint(len(name), buf)
            buf += name
        if fields & FIELD_CLASS:
            buf.append(ROAD_CLASSES.index(p.road))
        if fields & FIELD_TREE:
            buf.append(TREE_GROUPS.index(p.tree))
        if fields & FIELD_CIRCLES:
            if not p.radius or p.radius < 1:
                raise ValueError(f'circle radius {p.radius}')
            varint(p.radius, buf)
            lat, lng = p.rings[0][0]
            svarint(lat - plat, buf)
            svarint(lng - plng, buf)
            plat, plng = lat, lng
            continue
        varint(len(p.rings), buf)
        for ring in p.rings:
            if fields & FIELD_LINES:
                if len(ring) < 2:
                    raise ValueError(f'polyline of {len(ring)} points')
                stored = ring
            else:
                if len(ring) < 2 or ring[0] != ring[-1]:
                    raise ValueError(f'ring not closed ({len(ring)} points)')
                stored = ring[:-1]
            varint(len(stored), buf)
            for lat, lng in stored:
                svarint(lat - plat, buf)
                svarint(lng - plng, buf)
                plat, plng = lat, lng
    return buf


def decode(data):
    """Reads v1 or v2. Returns (version, fields, digits, [Poly]); rings are closed."""
    if data[:4] != b'MCPG':
        raise ValueError('not an MCPG file')
    version, count = struct.unpack_from('<II', data, 4)
    polys = []
    lat = lng = 0
    if version == 1:
        off = 12
        for _ in range(count):
            n = data[off]
            label = data[off + 1:off + 1 + n].decode('utf-8')
            off += 1 + n
            h, rc = struct.unpack_from('<HH', data, off)
            off += 4
            rings = []
            for _ in range(rc):
                m = struct.unpack_from('<I', data, off)[0]
                off += 4
                ring = []
                for _ in range(m):
                    dlat, dlng = struct.unpack_from('<ii', data, off)
                    off += 8
                    lat += dlat
                    lng += dlng
                    ring.append((lat, lng))
                rings.append(ring)
            use = label.split('|', 1)[1] if '|' in label else None
            polys.append(Poly(rings, label, None if h == 0xFFFF else h, use))
        return 1, None, 6, polys
    if version != 2:
        raise ValueError(f'unknown MCPG version {version}')
    fields, digits = data[12], data[13]
    off = 14

    def rv():
        nonlocal off
        v = shift = 0
        while True:
            b = data[off]
            off += 1
            v |= (b & 0x7F) << shift
            if b < 0x80:
                return v
            shift += 7

    def rs():
        v = rv()
        return (v >> 1) ^ -(v & 1)

    for _ in range(count):
        p = Poly([])
        if fields & FIELD_HEIGHT:
            h = rv()
            p.height = h - 1 if h else None
        if fields & FIELD_USE:
            p.use = USES[data[off]]
            off += 1
        if fields & FIELD_AREA:
            p.area = data[off]
            off += 1
        if fields & FIELD_NAME:
            n = rv()
            p.name = data[off:off + n].decode('utf-8') or None
            off += n
        if fields & FIELD_CLASS:
            p.road = ROAD_CLASSES[data[off]]
            off += 1
        if fields & FIELD_TREE:
            p.tree = TREE_GROUPS[data[off]]
            off += 1
        if fields & FIELD_CIRCLES:
            p.radius = rv()
            lat += rs()
            lng += rs()
            p.rings = [[(lat, lng)]]
            polys.append(p)
            continue
        for _ in range(rv()):
            ring = []
            for _ in range(rv()):
                lat += rs()
                lng += rs()
                ring.append((lat, lng))
            if not fields & FIELD_LINES:
                ring.append(ring[0])
            p.rings.append(ring)
        polys.append(p)
    if off != len(data):
        raise ValueError(f'{len(data) - off} bytes left over')
    return 2, fields, digits, polys


def main(argv):
    fmt = 'v2'
    if argv[:1] == ['--format']:
        fmt, argv = argv[1], argv[2:]
    kind = argv[0]
    if kind == 'decode':
        data = open(argv[1], 'rb').read()
        version, fields, digits, polys = decode(data)
        vertices = sum(len(r) for p in polys for r in p.rings)
        rings = sum(len(p.rings) for p in polys)
        what = 'circles' if fields and fields & FIELD_CIRCLES else 'polylines' if fields and fields & FIELD_LINES else 'polygons'
        print(f'v{version} fields={fields} digits={digits} {len(polys)} {what}, {rings} rings, {vertices} vertices, '
              f'raw {len(data)} B, gzip -9 {len(gzip.compress(data, 9))} B')
        return
    digits = 6
    if kind == 'trees':
        src, out = argv[1:3]
        digits = TREE_DIGITS
        polys, stats = read_trees(src, digits)
        print('trees: ' + ', '.join(f'{k} {v}' for k, v in stats.items()))
        fields = FIELD_TREE | FIELD_CIRCLES
    elif kind == 'roads':
        src, boundary_path, out = argv[1:4]
        digits = ROAD_DIGITS
        polys = read_roads(src, boundary_path, digits)
        stats = simplify_roads(polys, digits, ROAD_TOLERANCE_M)
        print('roads simplified: ' + ', '.join(f'{k} {v}' for k, v in stats.items()))
        fields = FIELD_NAME | FIELD_CLASS | FIELD_LINES
    elif kind == 'downtown':
        if fmt != 'v2':
            raise SystemExit('downtown is written as v2 only (its v1 form was JSON)')
        src, out = argv[1:3]
        polys = read_downtown(src)
        fields = FIELD_HEIGHT | FIELD_AREA | FIELD_NAME
    else:
        src, boundary_path, out = argv[1:4]
        if kind == 'parcels' and fmt == 'v2':
            digits = PARCEL_DIGITS
        polys = read_sources(kind, src, boundary_path, argv[4] if len(argv) > 4 else None, digits)
        fields = FIELD_HEIGHT if kind == 'buildings' else FIELD_USE
        if kind == 'parcels' and fmt == 'v2':
            stats = simplify_parcels(polys, digits, PARCEL_TOLERANCE_M)
            print('parcels simplified: ' + ', '.join(f'{k} {v}' for k, v in stats.items()))
    buf = write_v1(polys) if fmt == 'v1' else write_v2(polys, fields, digits)
    # Read it back: the shapes, heights, land uses, areas and names must be the ones written.
    _, _, back_digits, back = decode(bytes(buf))
    assert back_digits == digits and len(back) == len(polys)
    for a, b in zip(polys, back):
        assert a.rings == b.rings and a.height == b.height and (a.use or None) == (b.use or None)
        if fmt == 'v2':
            assert a.area == b.area and (a.name or None) == b.name and a.road == b.road
            assert a.tree == b.tree and a.radius == b.radius
    open(out, 'wb').write(buf)
    vertices = sum(len(r) for p in polys for r in p.rings)
    what = 'circles' if fields & FIELD_CIRCLES else 'polylines' if fields & FIELD_LINES else 'polygons'
    print(f'{kind} {fmt}: {len(polys)} {what}, {vertices} vertices, digits {digits}, {len(buf) / 1e6:.2f} MB')


if __name__ == '__main__':
    main(sys.argv[1:])
