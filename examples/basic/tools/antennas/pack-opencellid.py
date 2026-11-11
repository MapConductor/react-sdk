"""Convert supplied OpenCellID MCC 310-314 CSV files to compact example assets.

Derived data: OpenCellID, CC BY-SA 4.0. No coordinate or range approximation
except rounding coordinates to five decimals. Each source row remains a separate cell.
"""
import csv
import argparse
import gzip
import hashlib
import json
import struct
from pathlib import Path

ATT = {16, 30, 70, 80, 90, 150, 170, 280, 380, 410, 670, 680, 950}
TMOBILE = {120, 160, 200, 210, 220, 230, 240, 250, 260, 270, 310, 490, 530, 660, 770, 800, 830}
VERIZON = {10, 12, 13, 350, 820, 910, *range(590, 600), *range(890, 900)}
ASSIGNMENTS = {
    310: (ATT, TMOBILE, VERIZON),
    311: ({70, 90, 180, 190}, {225, 228, 229, 260, 490, 580, 588, 589, 870, 880, 882, 940},
          {110, *range(270, 290), 390, 440, *range(480, 490), 590, 800, 810}),
    312: ({90, 670, 680}, {190, 250, 530}, {770}),
    313: ({100, 110, 120, 130, 140, 210}, set(), set()),
    314: ({260, 270, 390}, set(), set()),
}
# Assignment source: https://imsiadmin.com/assignments/hni/ (2026-11-10).
# Sprint's 310-120 belongs to the combined T-Mobile / Sprint category.
def pack(sources, destinations):
    records = bytearray()
    counts = [0, 0, 0, 0]
    mcc_counts = {}
    for source in sources:
        with gzip.open(source, 'rt') as stream:
            for row in csv.reader(stream):
                radio, mcc, mnc = row[0], int(row[1]), int(row[2])
                if mcc not in ASSIGNMENTS or radio == 'CDMA':
                    raise ValueError('Expected MCC 310-314 PLMN identifiers; CDMA uses SID instead of MNC')
                lon, lat, radius = float(row[6]), float(row[7]), float(row[8])
                if not (-90 <= lat <= 90 and -180 <= lon <= 180 and 0 < radius <= 100000):
                    raise ValueError('Invalid coordinate or range')
                carrier = next((i for i, codes in enumerate(ASSIGNMENTS[mcc]) if mnc in codes), 3)
                counts[carrier] += 1
                mcc_counts[mcc] = mcc_counts.get(mcc, 0) + 1
                # Integer E5 coordinates preserve decimal precision (float32 does not).
                records.extend(struct.pack('<iifI', round(lat * 100000), round(lon * 100000), radius, carrier * 1000 + mnc))
    payload = b'MCCE' + struct.pack('<I', sum(counts)) + records
    for destination in destinations:
        Path(destination).write_bytes(payload)
        Path(destination).with_suffix('.json').write_text(json.dumps({
            'source': 'https://opencellid.org',
            'license': 'https://creativecommons.org/licenses/by-sa/4.0/',
            'attribution': 'Cell tower data from OpenCellID · CC BY-SA 4.0',
            'inputs': [Path(s).name for s in sources],
            'count': sum(counts), 'carrier_counts': counts, 'mcc_counts': mcc_counts,
            'file_sha256': hashlib.sha256(payload).hexdigest(), 'bytes': len(payload),
            'format': 'MCCE + u32 count + records (i32 latitude_e5, i32 longitude_e5, f32 range_m, u32 carrier*1000+MNC), little endian',
            'classification_source': 'https://imsiadmin.com/assignments/hni/',
            'coverage': 'Supplied MCC 310-314 files; not a complete inventory of physical towers',
        }, indent=2) + '\n')
    print(dict(zip(['AT&T', 'T-Mobile / Sprint', 'Verizon', 'Others'], counts)))
    print('bytes:', len(payload))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sources', nargs='+')
    parser.add_argument('--output', action='append', required=True)
    args = parser.parse_args()
    pack(args.sources, args.output)
