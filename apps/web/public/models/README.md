# 3D skeleton model

Put the downloaded model here, then tell me — I'll load it in-app with clickable
body regions (true click-a-bone → that part's studies), working offline.

Accepted layouts (either is fine):

1. **Single GLB file**

       apps/web/public/models/skeleton.glb

2. **GLTF folder** (typical Sketchfab download — keep the files together)

       apps/web/public/models/skeleton/scene.gltf
       apps/web/public/models/skeleton/scene.bin
       apps/web/public/models/skeleton/textures/...

You can keep the original folder name; just drop the whole folder inside
`public/models/`. After it's in, reply "added" and I'll wire it up.
