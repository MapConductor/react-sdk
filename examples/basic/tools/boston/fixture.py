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

# Two road polylines (fields name | road class | lines, 1e-5 degree): a multi-byte
# name, an open path (no closing vertex added by the reader), and a nameless
# two-point line that steps back west and south of the first.
from pack import FIELD_NAME, FIELD_CLASS, FIELD_LINES
roads = [
    Poly([[(4235545, -7106050), (4235555, -7106040), (4235560, -7106020)]], name='Café Street ☕', road='primary'),
    Poly([[(4230000, -7110000), (4229990, -7110010)]], name=None, road='path'),
]
bufr = bytes(write_v2(roads, FIELD_NAME | FIELD_CLASS | FIELD_LINES, 5))
back = decode(bufr)[3]
assert [p.rings for p in back] == [p.rings for p in roads]
assert [(p.name, p.road) for p in back] == [(p.name, p.road) for p in roads]
print('roads 1e-5:', bufr.hex())

# Two circles (fields tree group | circles, 1e-5 degree): a 150.0 m radius (a
# two-byte varint) and a 0.1 m one, the second centre west and south of the first.
from pack import FIELD_TREE, FIELD_CIRCLES
circles = [
    Poly([[(4235545, -7106050)]], tree='oak', radius=1500),
    Poly([[(4230000, -7110000)]], tree='other', radius=1),
]
bufc = bytes(write_v2(circles, FIELD_TREE | FIELD_CIRCLES, 5))
back = decode(bufc)[3]
assert [(p.rings, p.tree, p.radius) for p in back] == [(p.rings, p.tree, p.radius) for p in circles]
print('trees 1e-5:', bufc.hex())
