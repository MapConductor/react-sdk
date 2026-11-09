# Writes the small MCPG v2 files the decoding unit tests of the three samples
# share (React test/bostonData.test.mjs, Android BostonDataTest.kt, iOS
# BostonDataTests.swift), as hex: every field, at 1e-6 and at 1e-5 degree.
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pack import Poly, write_v2, decode

polys = [
    # A hole, 12.3 m high, a multi-byte UTF-8 name, land use condo, area 1
    Poly([[(42355450, -71060500), (42355450, -71059500), (42356450, -71059500), (42356450, -71060500), (42355450, -71060500)],
          [(42355700, -71060200), (42356000, -71060200), (42356000, -71059800), (42355700, -71060200)]],
         height=123, use='condo', area=1, name='Café ☕'),
    # Height unknown, no name, land use unknown, area 2; a long negative step back from the previous ring
    Poly([[(42300000, -71100000), (42300010, -71099990), (42299990, -71099990), (42300000, -71100000)]],
         height=None, use='unknown', area=2, name=None),
]
buf6 = bytes(write_v2(polys, 15, 6))
assert [p.rings for p in decode(buf6)[3]] == [p.rings for p in polys]
print('1e-6:', buf6.hex())

# The same polygons at 1e-5 degree (every coordinate above is a multiple of 10).
coarse = [Poly([[(lat // 10, lng // 10) for lat, lng in r] for r in p.rings], height=p.height, use=p.use, area=p.area, name=p.name)
          for p in polys]
assert all(lat % 10 == 0 and lng % 10 == 0 for p in polys for r in p.rings for lat, lng in r)
buf5 = bytes(write_v2(coarse, 15, 5))
assert [p.rings for p in decode(buf5)[3]] == [p.rings for p in coarse]
print('1e-5:', buf5.hex())
