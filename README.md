# Eternal Roses 3D — React + Three.js

Interactive 3D bouquet experience inspired by the supplied bouquet photo.

## What was improved

- Rebuilt the bouquet so the **rose dome, wrapping paper, collar and ribbon align together** as one believable bouquet.
- Added a **Vietnamese Women's Day 20/10 dedication** for a girlfriend.
- Added **romantic background music** using the browser Web Audio API, so no external audio file is required.
- Increased bouquet depth and density so the roses feel more volumetric and realistic.
- Kept drag-to-rotate, zoom, reset and falling petals interactions.

## Run

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Important note

This bouquet is still a **procedural 3D approximation**, not a photogrammetry reconstruction from the image. For near-photographic realism from every angle, replace the procedural bouquet with a licensed high-quality GLB/GLTF model.


## Music

The sound button now uses the supplied YouTube track via the YouTube IFrame API and starts playback from 0:58 when the user presses the music button.
# Eternal_Roses
