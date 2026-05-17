/**
 * SignalForge 3D — Equipment Builder
 * Creates Function Generator, Oscilloscope, BNC Cable, Breadboard,
 * Lab Notebook, Wall Display, and Challenge Board.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface EquipmentRefs {
  // Function Generator
  funcGenBody: Mesh;
  funcGenScreen: Mesh;
  ampKnob: Mesh;
  freqKnob: Mesh;
  phaseKnob: Mesh;
  decayKnob: Mesh;
  tsKnob: Mesh;
  discreteToggle: Mesh;
  // Oscilloscope
  oscBody: Mesh;
  oscilloscopeScreen: Mesh;
  // Cable
  bncCable: Mesh;
  // Displays
  wallDisplay: Mesh;
  challengeBoard: Mesh;
}

export function buildEquipment(scene: Scene): EquipmentRefs {

  // ══════════════════════════════════════
  // 1. FUNCTION GENERATOR
  // ══════════════════════════════════════
  const fgMat = new StandardMaterial("fgMat", scene);
  fgMat.diffuseColor = new Color3(0.118, 0.118, 0.227); // #1e1e3a
  fgMat.specularColor = new Color3(0.15, 0.15, 0.2);
  fgMat.specularPower = 32;

  const funcGenBody = MeshBuilder.CreateBox("funcGenBody", { width: 0.8, height: 0.5, depth: 0.6 }, scene);
  funcGenBody.position = new Vector3(-1.2, 1.1, 0);
  funcGenBody.material = fgMat;

  // FG Screen (small LCD display)
  const fgScreen = MeshBuilder.CreatePlane("funcGenScreen", { width: 0.35, height: 0.12 }, scene);
  fgScreen.position = new Vector3(-1.2, 1.25, -0.301);
  fgScreen.material = createEmissiveMat(scene, "fgScreenMat", new Color3(0, 0.3, 0.35));

  // Rotary Knobs
  const knobColor = new Color3(0, 0.898, 0.784); // #00e5c8
  const ampKnob = createKnob(scene, "ampKnob", new Vector3(-1.4, 1.05, -0.301), knobColor);
  const freqKnob = createKnob(scene, "freqKnob", new Vector3(-1.2, 1.05, -0.301), knobColor);
  const phaseKnob = createKnob(scene, "phaseKnob", new Vector3(-1.0, 1.05, -0.301), knobColor);

  // Decay knob (below main knobs)
  const decayKnob = createKnob(scene, "decayKnob", new Vector3(-1.3, 0.93, -0.301), new Color3(0.655, 0.545, 0.98)); // purple
  const tsKnob = createKnob(scene, "tsKnob", new Vector3(-1.1, 0.93, -0.301), new Color3(1, 0.84, 0));

  // Knob labels
  createSmallLabel(scene, "AMP", new Vector3(-1.4, 1.13, -0.31));
  createSmallLabel(scene, "FREQ", new Vector3(-1.2, 1.13, -0.31));
  createSmallLabel(scene, "PHASE", new Vector3(-1.0, 1.13, -0.31));
  createSmallLabel(scene, "DECAY", new Vector3(-1.3, 1.0, -0.31));
  createSmallLabel(scene, "Ts", new Vector3(-1.1, 1.0, -0.31));

  // Toggle switch
  const toggleMat = new StandardMaterial("toggleMat", scene);
  toggleMat.diffuseColor = new Color3(1, 0.42, 0.42); // #ff6b6b
  toggleMat.emissiveColor = new Color3(0.3, 0.1, 0.1);
  const discreteToggle = MeshBuilder.CreateBox("discreteToggle", { width: 0.1, height: 0.04, depth: 0.04 }, scene);
  discreteToggle.position = new Vector3(-1.45, 0.93, -0.301);
  discreteToggle.material = toggleMat;
  createSmallLabel(scene, "D/C", new Vector3(-1.45, 0.88, -0.31));

  // BNC Output port
  const bncOutMat = new StandardMaterial("bncOutMat", scene);
  bncOutMat.diffuseColor = new Color3(0.7, 0.7, 0.72);
  bncOutMat.specularColor = new Color3(0.8, 0.8, 0.8);
  const bncOut = MeshBuilder.CreateCylinder("bncOut", { diameter: 0.05, height: 0.04 }, scene);
  bncOut.position = new Vector3(-0.79, 1.1, 0);
  bncOut.rotation.z = Math.PI / 2;
  bncOut.material = bncOutMat;

  // ══════════════════════════════════════
  // 2. OSCILLOSCOPE
  // ══════════════════════════════════════
  const oscMat = new StandardMaterial("oscMat", scene);
  oscMat.diffuseColor = new Color3(0.082, 0.082, 0.157); // #151528
  oscMat.specularColor = new Color3(0.1, 0.1, 0.15);

  const oscBody = MeshBuilder.CreateBox("oscBody", { width: 0.9, height: 0.6, depth: 0.5 }, scene);
  oscBody.position = new Vector3(1.2, 1.15, 0);
  oscBody.material = oscMat;

  // CRT Screen
  const crtMat = new StandardMaterial("crtMat", scene);
  crtMat.diffuseColor = new Color3(0, 0.05, 0);
  crtMat.emissiveColor = new Color3(0, 0.1, 0); // #001a00
  crtMat.specularColor = Color3.Black();

  const oscilloscopeScreen = MeshBuilder.CreatePlane("oscilloscopeScreen", { width: 0.6, height: 0.4 }, scene);
  oscilloscopeScreen.position = new Vector3(1.2, 1.22, -0.251);
  oscilloscopeScreen.material = crtMat;

  // BNC Input port
  const bncIn = MeshBuilder.CreateCylinder("bncIn", { diameter: 0.05, height: 0.04 }, scene);
  bncIn.position = new Vector3(0.74, 1.15, 0);
  bncIn.rotation.z = Math.PI / 2;
  bncIn.material = bncOutMat;

  // ══════════════════════════════════════
  // 3. BNC CABLE
  // ══════════════════════════════════════
  const cablePath = [
    new Vector3(-0.79, 1.1, 0),
    new Vector3(-0.65, 1.08, 0.1),
    new Vector3(-0.4, 1.03, 0.2),
    new Vector3(-0.1, 1.0, 0.28),
    new Vector3(0.2, 1.0, 0.25),
    new Vector3(0.45, 1.03, 0.18),
    new Vector3(0.6, 1.08, 0.08),
    new Vector3(0.74, 1.15, 0),
  ];

  const cableMat = new StandardMaterial("cableMat", scene);
  cableMat.diffuseColor = new Color3(0, 0.6, 0.55);
  cableMat.emissiveColor = new Color3(0, 0.36, 0.31); // ~40% of #00e5c8
  cableMat.specularColor = Color3.Black();

  const bncCable = MeshBuilder.CreateTube("bncCable", {
    path: cablePath,
    radius: 0.02,
    tessellation: 12,
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  bncCable.material = cableMat;

  // ══════════════════════════════════════
  // 4. BREADBOARD
  // ══════════════════════════════════════
  const bbMat = new StandardMaterial("bbMat", scene);
  bbMat.diffuseColor = new Color3(0.102, 0.227, 0.102); // #1a3a1a
  bbMat.specularColor = new Color3(0.05, 0.1, 0.05);

  const breadboard = MeshBuilder.CreateBox("breadboard", { width: 0.6, height: 0.02, depth: 0.35 }, scene);
  breadboard.position = new Vector3(0, 0.86, 0);
  breadboard.material = bbMat;

  // Breadboard holes (simplified — 4x8 grid)
  const holeMat = new StandardMaterial("holeMat", scene);
  holeMat.diffuseColor = new Color3(0.06, 0.15, 0.06);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const hole = MeshBuilder.CreateCylinder(`bbHole_${r}_${c}`, { diameter: 0.016, height: 0.008 }, scene);
      hole.position = new Vector3(
        -0.21 + c * 0.06,
        0.875,
        -0.1 + r * 0.07
      );
      hole.material = holeMat;
    }
  }

  // ══════════════════════════════════════
  // 5. LAB NOTEBOOK
  // ══════════════════════════════════════
  const coverMat = new StandardMaterial("coverMat", scene);
  coverMat.diffuseColor = new Color3(0.165, 0.102, 0.039); // #2a1a0a

  const cover = MeshBuilder.CreateBox("notebookCover", { width: 0.25, height: 0.015, depth: 0.35 }, scene);
  cover.position = new Vector3(1.6, 0.87, 0.45);
  cover.rotation.y = 0.2;
  cover.material = coverMat;

  const pagesMat = new StandardMaterial("pagesMat", scene);
  pagesMat.diffuseColor = new Color3(0.94, 0.91, 0.816); // #f0e8d0
  pagesMat.emissiveColor = new Color3(0.1, 0.09, 0.08);

  const pages = MeshBuilder.CreateBox("notebookPages", { width: 0.23, height: 0.012, depth: 0.33 }, scene);
  pages.position = new Vector3(1.6, 0.884, 0.45);
  pages.rotation.y = 0.2;
  pages.material = pagesMat;

  // ══════════════════════════════════════
  // 6. WALL DISPLAY (back wall)
  // ══════════════════════════════════════
  const displayMat = new StandardMaterial("displayMat", scene);
  displayMat.diffuseColor = new Color3(0.039, 0.039, 0.102); // #0a0a1a
  displayMat.emissiveColor = new Color3(0.02, 0.02, 0.05);
  displayMat.specularColor = Color3.Black();

  const wallDisplay = MeshBuilder.CreatePlane("wallDisplay", { width: 2, height: 1.2 }, scene);
  wallDisplay.position = new Vector3(0, 2.5, 4.98);
  wallDisplay.material = displayMat;

  // Display border frame
  const frameMat = new StandardMaterial("frameMat", scene);
  frameMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
  frameMat.emissiveColor = new Color3(0, 0.15, 0.13);

  const frameTop = MeshBuilder.CreateBox("frameTop", { width: 2.1, height: 0.03, depth: 0.03 }, scene);
  frameTop.position = new Vector3(0, 3.11, 4.97);
  frameTop.material = frameMat;
  const frameBot = MeshBuilder.CreateBox("frameBot", { width: 2.1, height: 0.03, depth: 0.03 }, scene);
  frameBot.position = new Vector3(0, 1.89, 4.97);
  frameBot.material = frameMat;

  // ══════════════════════════════════════
  // 7. CHALLENGE BOARD (left wall)
  // ══════════════════════════════════════
  const cbMat = new StandardMaterial("cbMat", scene);
  cbMat.diffuseColor = new Color3(0.039, 0.039, 0.102);
  cbMat.emissiveColor = new Color3(0.03, 0.02, 0.05);
  cbMat.specularColor = Color3.Black();

  const challengeBoard = MeshBuilder.CreatePlane("challengeBoard", { width: 1.5, height: 1 }, scene);
  challengeBoard.position = new Vector3(-4.98, 2, 0);
  challengeBoard.rotation.y = Math.PI / 2;
  challengeBoard.material = cbMat;

  // Challenge board border (purple)
  const cbBorderMat = new StandardMaterial("cbBorderMat", scene);
  cbBorderMat.diffuseColor = new Color3(0.1, 0.05, 0.15);
  cbBorderMat.emissiveColor = new Color3(0.13, 0.11, 0.196); // ~20% of #a78bfa
  const cbBorderTop = MeshBuilder.CreateBox("cbBorderTop", { width: 0.02, height: 1.04, depth: 0.02 }, scene);
  cbBorderTop.position = new Vector3(-4.97, 2, -0.76);
  cbBorderTop.material = cbBorderMat;
  const cbBorderBot = MeshBuilder.CreateBox("cbBorderBot", { width: 0.02, height: 1.04, depth: 0.02 }, scene);
  cbBorderBot.position = new Vector3(-4.97, 2, 0.76);
  cbBorderBot.material = cbBorderMat;

  return {
    funcGenBody,
    funcGenScreen: fgScreen,
    ampKnob,
    freqKnob,
    phaseKnob,
    decayKnob,
    tsKnob,
    discreteToggle,
    oscBody,
    oscilloscopeScreen,
    bncCable,
    wallDisplay,
    challengeBoard,
  };
}

// ── Helpers ──

function createKnob(scene: Scene, name: string, position: Vector3, color: Color3): Mesh {
  const mat = new StandardMaterial(`${name}Mat`, scene);
  mat.diffuseColor = color;
  mat.emissiveColor = color.scale(0.3);
  mat.specularColor = new Color3(0.4, 0.4, 0.4);

  const knob = MeshBuilder.CreateCylinder(name, { diameter: 0.06, height: 0.04 }, scene);
  knob.position = position;
  knob.rotation.x = Math.PI / 2;
  knob.material = mat;

  // Knob indicator line
  const indicator = MeshBuilder.CreateBox(`${name}_indicator`, { width: 0.003, height: 0.045, depth: 0.025 }, scene);
  indicator.parent = knob;
  indicator.position = new Vector3(0, 0, 0.015);
  const indMat = new StandardMaterial(`${name}_indMat`, scene);
  indMat.diffuseColor = Color3.White();
  indMat.emissiveColor = Color3.White();
  indicator.material = indMat;

  return knob;
}

function createEmissiveMat(scene: Scene, name: string, emissive: Color3): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.Black();
  mat.emissiveColor = emissive;
  mat.specularColor = Color3.Black();
  return mat;
}

function createSmallLabel(scene: Scene, text: string, position: Vector3): void {
  const w = Math.max(text.length * 0.025, 0.08);
  const plane = MeshBuilder.CreatePlane(`lbl_${text}`, { width: w, height: 0.03 }, scene);
  plane.position = position;

  const dt = new DynamicTexture(`dt_lbl_${text}`, { width: 128, height: 32 }, scene, false);
  dt.hasAlpha = true;
  const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, 128, 32);
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = "#a0a0b0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 16);
  dt.update();

  const mat = new StandardMaterial(`lbl_${text}_mat`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = new Color3(0.4, 0.4, 0.45);
  mat.specularColor = Color3.Black();
  mat.backFaceCulling = false;
  mat.useAlphaFromDiffuseTexture = true;
  plane.material = mat;
}
