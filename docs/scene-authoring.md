# Scene Authoring Contract for AI Agents

> Read this before creating any scene objects, meshes, lights, cameras, materials, or layout changes.

---

## The Three-Layer Rule

```
assets/example.scene/   ← source of truth, what CreatorEngine Editor reads and shows
public/scene/           ← generated output from the editor scene, what the app loads
src/scripts/*.ts        ← runtime behavior only, animates/controls named editor objects
```

**Persistent visual things belong in `assets/example.scene/`.  
Runtime scripts only animate or control things already in the editor scene.**

If you create an object only in TypeScript with `MeshBuilder`, it will run in the browser but CreatorEngine Editor will not see it. The editor tree will not show it. Artists and designers cannot inspect or modify it. The next `yarn generate` will not include it in the packed scene unless it was already in the editor scene.

---

## Decision Tree

```
Do you need to add a visual object (mesh, light, camera, layout)?
│
├── Does it need to be visible/editable in CreatorEngine Editor?
│   ├── YES → see "Path A: Editor-First" or "Path B: Bake Script" below
│   └── NO  → temporary effects only (particles, debug helpers)
│             → MeshBuilder in src/scripts/** is acceptable
│
└── Does the object require complex procedural geometry?
    ├── NO  → Path A: ask the user to create it in the editor, then reference by name
    └── YES → Path B: write a bake script
```

---

## Path A — Editor-First (Preferred)

When an object can be placed manually, do not write TypeScript to create it. Instead:

1. Instruct the user:
   > "Please open CreatorEngine Editor and add a [mesh/light/camera] named `object-name`. Then save the scene and run `yarn generate`."

2. In your script, reference it by name:

```ts
// Good — references an object the editor knows about
const platform = scene.getMeshByName("platform");
const reactor = scene.getMeshByName("reactor-core");
const spawnPoint = scene.getTransformNodeByName("spawn-point");
```

3. Never do this for persistent visual objects:

```ts
// Bad — editor cannot see this, it exists only at runtime
const reactor = MeshBuilder.CreateSphere("reactor-core", { diameter: 20 }, scene);
```

**The editor is the source of truth for what is in the world. Scripts only control what the editor placed.**

---

## Path B — Bake Script (Procedural Geometry)

When geometry is too complex to hand-author in the editor, write a bake script that generates valid editor scene files. This is the only correct way to add procedural geometry that the editor can see.

### How the scene file format works

`assets/example.scene/` is a folder. Each object lives in its own JSON file:

```
assets/example.scene/
├── config.json                          ← scene-level settings
├── meshes/{uuid}.json                   ← one file per mesh/group
├── geometries/{uuid}.babylonbinarymeshdata  ← binary vertex data for each mesh
├── lights/{uuid}.json                   ← one file per light
├── cameras/{uuid}.json                  ← one file per camera
└── shadowGenerators/{uuid}.json
```

**TransformNodes have no geometry** and can be written as pure JSON without a binary file. Use them as named anchor points, spawn locations, group parents, or invisible markers:

```json
{
  "meshes": [],
  "transformNodes": [
    {
      "name": "spawn-point",
      "id": "YOUR-UUID-HERE",
      "uniqueId": 1234567890,
      "type": "TransformNode",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scaling": [1, 1, 1],
      "isEnabled": true,
      "metadata": {},
      "animations": [],
      "ranges": []
    }
  ],
  "cameras": [],
  "lights": [],
  "materials": [],
  "geometries": { "boxes": [], "spheres": [], "cylinders": [], "toruses": [], "grounds": [], "planes": [], "torusKnots": [], "vertexData": [] },
  "metadata": {}
}
```

Save this file as `assets/example.scene/meshes/{uuid}.json` (use any consistent UUID v4 string for `id`, `uniqueId` can be `Date.now()`).

**For actual meshes with geometry**, you need both the JSON and the binary geometry file. Use a bake script:

### Bake script pattern

Create `scripts/bake-editor.mjs`:

```js
import { NullEngine } from "@babylonjs/core/Engines/nullEngine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { SceneSerializer } from "@babylonjs/core/Misc/sceneSerializer.js";
import { writeFileSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";

const engine = new NullEngine();
const scene = new Scene(engine);

// Create your procedural geometry here
const platform = MeshBuilder.CreateBox("platform", { width: 200, height: 10, depth: 200 }, scene);
platform.position.y = -5;

// Serialize and write
const serialized = SceneSerializer.SerializeMesh(platform, false, true);
const id = randomUUID();
serialized.meshes[0].id = id;
serialized.meshes[0].uniqueId = Date.now();

mkdirSync("assets/example.scene/meshes", { recursive: true });
writeFileSync(`assets/example.scene/meshes/${id}.json`, JSON.stringify(serialized, null, 4));

console.log(`Baked: platform → assets/example.scene/meshes/${id}.json`);
engine.dispose();
```

Add to `package.json` scripts:

```json
"bake:editor": "node scripts/bake-editor.mjs"
```

Run the bake step before packing:

```bash
yarn bake:editor
yarn generate
```

The editor will now show the baked objects in the scene tree.

---

## Path C — TransformNode as Named Anchor (Lightweight)

For spawn points, waypoints, UI anchors, camera targets, or group parents that have no visible geometry, write a TransformNode JSON directly. No binary file needed. The editor will show it in the scene tree.

Steps:
1. Generate a UUID (any UUID v4 string, e.g. from `crypto.randomUUID()` in Node)
2. Write `assets/example.scene/meshes/{uuid}.json` using the TransformNode template above
3. Run `yarn generate`
4. Reference in scripts: `scene.getTransformNodeByName("spawn-point")`

---

## After Any Scene Change

Always run in order:

```bash
yarn generate   # packs assets/example.scene/ into public/scene/
yarn dev        # or yarn build for production
```

Never edit `public/scene/example.babylon` directly — it is generated output. The next `yarn generate` will overwrite any manual edits.

---

## What Scripts Are Allowed To Do

Scripts in `src/scripts/**` are runtime behavior. They are the right place for:

- Animating position, rotation, scale of named editor objects
- Responding to input (keyboard, mouse, XR controller)
- Spawning temporary visual effects (particles, debug meshes, trails)
- Changing materials or colors dynamically
- Running game logic, scoring, state machines
- Playing sounds or triggering animations

Scripts are **not** the right place for:

- Creating the permanent geometry of a room, level, character, or UI panel
- Placing lights that define the mood of the scene
- Setting up cameras that the designer needs to adjust
- Defining the layout of the world

---

## Validation Checklist

After adding any scene object, verify:

- [ ] The object appears in CreatorEngine Editor's scene tree
- [ ] `assets/example.scene/` contains the expected file (`meshes/`, `lights/`, etc.)
- [ ] `yarn generate` completes without errors
- [ ] `public/scene/example.babylon` is updated (check modified timestamp)
- [ ] The object is visible when running `yarn dev`
- [ ] Scripts reference the object by its editor name, not by constructing it in code

---

## Summary Rules

1. **Editor first.** If it is a permanent visual thing, it belongs in `assets/example.scene/`.
2. **Reference by name.** Scripts call `scene.getMeshByName()`, not `MeshBuilder`.
3. **Bake procedural geometry.** If MeshBuilder is needed, write a bake script that outputs editor scene files, then run `yarn generate`.
4. **TransformNodes are free.** No binary geometry needed — write the JSON directly for anchors and parents.
5. **Never edit `public/scene/` by hand.** It is generated output.
6. **Always run `yarn generate` after touching `assets/example.scene/`.**
