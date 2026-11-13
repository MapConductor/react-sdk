"""Build the offline FCC antenna horizon sample (no owner/contact details)."""
import argparse, collections, hashlib, json, math, pathlib, struct, zipfile

def build(source, destination):
 z=zipfile.ZipFile(source); towers={}; excluded=collections.Counter()
 for line in z.open('RA.dat'):
  a=line.decode('latin1').rstrip('\r\n').split('|')
  try:
   if a[15]!='C' or a[8]!='C' or a[13]: continue
   height=float(a[30])
   if not 0<height<=1000: excluded['height']+=1;continue
   towers[a[4]]=(int(a[3]),height)
  except (ValueError,IndexError): excluded['registration']+=1
 rows={}
 for line in z.open('CO.dat'):
  a=line.decode('latin1').rstrip('\r\n').split('|')
  if a[4] not in towers or a[5]!='T':continue
  try:
   lat=(float(a[6])+float(a[7])/60+float(a[8])/3600)*(-1 if a[9]=='S' else 1)
   lon=(float(a[11])+float(a[12])/60+float(a[13])/3600)*(-1 if a[14]=='W' else 1)
   if not (-90<lat<90 and -180<=lon<=180) or lat==lon==0:continue
   reg,height=towers[a[4]];rows[reg]=(lat,lon,height,reg)
  except (ValueError,IndexError):excluded['coordinates']+=1
 rows=sorted(rows.values()); data=b'MCCA'+struct.pack('<I',len(rows))+b''.join(struct.pack('<fffI',*r) for r in rows)
 pathlib.Path(destination).write_bytes(data)
 radii=[6378137*(math.acos(6378137/(6378137+r[2]))+math.acos(6378137/(6378137+1.5))) for r in rows]
 meta={'source':'https://data.fcc.gov/download/pub/uls/complete/r_tower.zip','source_sha256':hashlib.sha256(pathlib.Path(source).read_bytes()).hexdigest(),'file_sha256':hashlib.sha256(data).hexdigest(),'count':len(rows),'bytes':len(data),'receiver_height_m':1.5,'earth_radius_m':6378137,'min_radius_m':min(radii),'max_radius_m':max(radii),'excluded':dict(excluded),'filter':'RA archive_flag_code=C, status_code=C, empty date_dismantled; CO coordinate_type=T; unique registration number; 0 < overall_height_above_ground <= 1000 m','format':'MCCA + u32 count + count*(f32 latitude, f32 longitude, f32 height_m, u32 registration); little endian'}
 pathlib.Path(destination).with_suffix('.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta,indent=2))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('destination');a=p.parse_args();build(a.source,a.destination)
