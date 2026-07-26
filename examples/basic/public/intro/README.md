# Sample intro GIFs

The one-time "how to try this sample" overlay (see
`src/components/SampleIntroOverlay.tsx` and `src/samples/sampleIntro.ts`) shows
an optional animated GIF that demonstrates the interaction for each page.

Drop a file here named after the page id: `public/intro/<page>.gif`. It is
served at `/intro/<page>.gif`. If the file is missing, the overlay still shows
the text instruction and simply omits the image (the `<img>` hides itself on a
load error), so GIFs can be added incrementally.

Expected filenames (one per sample page):

- map.gif
- map-design.gif
- fly-to.gif
- tilt.gif
- visible-region.gif
- camera-sync.gif
- marker.gif
- marker-animation.gif
- post-office.gif
- post-office-cluster.gif
- circle.gif
- polyline.gif
- polyline-click.gif
- polygon.gif
- polygon-click.gif
- polygon-geodesic.gif
- polygon-hole.gif
- ground-image.gif
- raster-layer.gif
- info-bubble-simple.gif
- info-bubble-styled.gif
- info-bubble-multiple.gif
- info-bubble-rich.gif
- geojson-basic.gif
- geojson-layer.gif
- heatmap-layer.gif
- threejs-object.gif
