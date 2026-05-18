/**
 * SignalForge 3D — Lab Environment Builder
 * Creates the room, workbench, walls, floor grid, and dramatic lighting.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";

export interface LabEnvironmentRefs {
  floor: Mesh;
  table: Mesh;
  camera: ArcRotateCamera;
}

export function buildLabEnvironment(scene: Scene): LabEnvironmentRefs {
  // ── Scene background ──
  scene.clearColor = new Color4(0.95, 0.95, 0.97, 1); // Light background

  // ── Remove default camera if any ──
  if (scene.activeCamera) {
    scene.activeCamera.dispose();
  }

  // ── Camera ──
  const camera = new ArcRotateCamera(
    "labCamera",
    -Math.PI / 2,
    Math.PI / 2.5,
    7,
    new Vector3(0, 0.85, 0),
    scene
  );
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 12;
  camera.wheelPrecision = 30;
  camera.panningSensibility = 200;
  camera.minZ = 0.1;
  camera.attachControl(true);
  scene.activeCamera = camera;

  // ── Floor with photorealistic concrete texture ──
  const floor = MeshBuilder.CreateGround("labFloor", { width: 30, height: 30 }, scene);
  const floorMat = new StandardMaterial("floorMat", scene);
  const floorTex = new Texture("/images/floor.png", scene);
  floorTex.uScale = 5;
  floorTex.vScale = 5;
  floorMat.diffuseTexture = floorTex;
  floorMat.specularColor = new Color3(0.1, 0.1, 0.1);
  floorMat.specularPower = 32;
  floor.material = floorMat;
  floor.position.y = 0;

  // ── Walls ──
  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new Color3(0.98, 0.98, 1.0); // White walls
  wallMat.emissiveColor = new Color3(0.1, 0.1, 0.1);
  wallMat.specularColor = new Color3(0.1, 0.1, 0.1);

  // Back wall
  const backWall = MeshBuilder.CreatePlane("backWall", { width: 30, height: 12 }, scene);
  backWall.position = new Vector3(0, 6, 8);
  backWall.material = wallMat;

  // Front wall
  const frontWall = MeshBuilder.CreatePlane("frontWall", { width: 30, height: 12 }, scene);
  frontWall.position = new Vector3(0, 6, -10);
  frontWall.rotation.y = Math.PI;
  frontWall.material = wallMat;

  // Left wall
  const leftWall = MeshBuilder.CreatePlane("leftWall", { width: 20, height: 12 }, scene);
  leftWall.position = new Vector3(-10, 6, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.material = wallMat;

  // Right wall
  const rightWall = MeshBuilder.CreatePlane("rightWall", { width: 20, height: 12 }, scene);
  rightWall.position = new Vector3(10, 6, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.material = wallMat;

  // Ceiling
  const ceiling = MeshBuilder.CreatePlane("ceiling", { width: 30, height: 20 }, scene);
  ceiling.position = new Vector3(0, 12, -1);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.material = wallMat;

  // ── Workbench Table (Wooden) ──
  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.diffuseColor = new Color3(0.545, 0.27, 0.074); // SaddleBrown
  tableMat.specularColor = new Color3(0.2, 0.2, 0.1);
  tableMat.specularPower = 16;

  // Tabletop
  const tableTop = MeshBuilder.CreateBox("tableTop", { width: 5, height: 0.1, depth: 2 }, scene);
  tableTop.position = new Vector3(0, 0.85, 0);
  tableTop.material = tableMat;

  // Table legs (Dark Metal)
  const legMat = new StandardMaterial("legMat", scene);
  legMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
  legMat.specularColor = new Color3(0.4, 0.4, 0.4);

  const legPositions = [
    new Vector3(-2.3, 0.4, -0.8),
    new Vector3(-2.3, 0.4, 0.8),
    new Vector3(2.3, 0.4, -0.8),
    new Vector3(2.3, 0.4, 0.8),
  ];

  legPositions.forEach((pos, i) => {
    const leg = MeshBuilder.CreateBox(`tableLeg${i}`, { width: 0.1, height: 0.8, depth: 0.1 }, scene);
    leg.position = pos;
    leg.material = legMat;
  });

  // ── Scientist Posters & Whiteboard (Photorealistic) ──
  createScientistPoster(scene, "Fourier", "/images/fourier.png", new Vector3(-3.5, 4, 7.95));
  createScientistPoster(scene, "Nyquist", "/images/nyquist.png", new Vector3(3.5, 4, 7.95));
  createWhiteboard(scene, "/images/whiteboard.png", new Vector3(0, 4, 7.95));

  // ── Lighting ──
  // Main overhead point light
  const mainLight = new PointLight("mainLight", new Vector3(0, 5, 0), scene);
  mainLight.intensity = 0.9;
  mainLight.diffuse = new Color3(1, 0.98, 0.95);

  // Ambient fill
  const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.5;
  ambientLight.groundColor = new Color3(0.9, 0.9, 0.9);

  // Spot lights for dramatic effect
  const spot1 = new SpotLight("spotLight1", new Vector3(-1.5, 4, -1), new Vector3(0.3, -1, 0.2), Math.PI / 3, 4, scene);
  spot1.intensity = 0.5;
  spot1.diffuse = new Color3(1.0, 0.9, 0.9);

  // ── Axis Labels ──
  createAxisLabel(scene, "Z — TIME (t)", new Vector3(0, 1.65, 1.2), 0);
  createAxisLabel(scene, "Y — AMPLITUDE x(t)", new Vector3(-2.8, 2.2, 0), Math.PI / 2);

  return { floor, table: tableTop, camera };
}

function createAxisLabel(scene: Scene, text: string, position: Vector3, rotationZ: number): void {
  const planeWidth = text.length * 0.08;
  const labelPlane = MeshBuilder.CreatePlane(`label_${text}`, { width: planeWidth, height: 0.18 }, scene);
  labelPlane.position = position;
  labelPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

  const texRes = 512;
  const dt = new DynamicTexture(`dt_${text}`, { width: texRes, height: 64 }, scene, false);
  dt.hasAlpha = true;
  const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, texRes, 64);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(0, 0, texRes, 64);
  ctx.font = "bold 28px monospace";
  ctx.fillStyle = "#e02020";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, texRes / 2, 32);
  dt.update();

  const mat = new StandardMaterial(`labelMat_${text}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = new Color3(0.8, 0.8, 0.8);
  mat.specularColor = Color3.Black();
  mat.backFaceCulling = false;
  mat.useAlphaFromDiffuseTexture = true;
  labelPlane.material = mat;
}

function createScientistPoster(scene: Scene, name: string, imagePath: string, position: Vector3): void {
  const width = 2;
  const height = 2; // Generated images are 1:1 square
  const poster = MeshBuilder.CreatePlane(`poster_${name}`, { width, height }, scene);
  poster.position = position;

  const mat = new StandardMaterial(`mat_poster_${name}`, scene);
  const tex = new Texture(imagePath, scene);
  // Ensure the image is right-side up
  tex.vAng = Math.PI;
  tex.uAng = Math.PI;
  mat.diffuseTexture = tex;
  mat.specularColor = new Color3(0.2, 0.2, 0.2); // slight gloss like glass frame
  poster.material = mat;
}

function createWhiteboard(scene: Scene, imagePath: string, position: Vector3): void {
  const width = 3;
  const height = 3; // Generated images are 1:1 square
  const board = MeshBuilder.CreatePlane("whiteboard", { width, height }, scene);
  board.position = position;

  const mat = new StandardMaterial("mat_whiteboard", scene);
  const tex = new Texture(imagePath, scene);
  tex.vAng = Math.PI;
  tex.uAng = Math.PI;
  mat.diffuseTexture = tex;
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  board.material = mat;
}
