# python compare_v1_v2.py <v1.bin> <v2.bin>
# Reads a v1 and a v2 file of the same polygons at the same unit (buildings:
# both 1e-6) and checks that every polygon has the same shape (every vertex,
# closing one included), height and land use. Parcels are not comparable this
# way: their v2 file is at 1e-5 with near-collinear vertices dropped.
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pack import decode
_, _, da, a = decode(open(sys.argv[1], 'rb').read())
_, _, db, b = decode(open(sys.argv[2], 'rb').read())
assert da == db, f'different units: 1e-{da} and 1e-{db}'
assert len(a) == len(b), (len(a), len(b))
for i, (p, q) in enumerate(zip(a, b)):
    assert p.rings == q.rings, i
    assert p.height == q.height, (i, p.height, q.height)
    assert (p.use or 'unknown') == (q.use or 'unknown'), (i, p.use, q.use)
print(f'{len(a)} polygons, {sum(len(r) for p in a for r in p.rings)} vertices: same shapes, heights and land use')
