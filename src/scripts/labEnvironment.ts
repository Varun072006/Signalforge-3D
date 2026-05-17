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
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";

export interface LabEnvironmentRefs {
  floor: Mesh;
  table: Mesh;
  camera: ArcRotateCamera;
}

export function buildLabEnvironment(scene: Scene): LabEnvironmentRefs {
  // ── Scene background ──
  scene.clearColor = new Color4(0.012, 0.012, 0.059, 1); // #03030f

  // ── Remove default camera if any ──
  if (scene.activeCamera) {
    scene.activeCamera.dispose();
  }

  // ── Camera ──
  const camera = new ArcRotateCamera(
    "labCamera",
    -Math.PI / 2,
    Math.PI / 3,
    6,
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

  // ── Floor with grid ──
  const floor = MeshBuilder.CreateGround("labFloor", { width: 20, height: 20 }, scene);
  const gridMat = new GridMaterial("gridMat", scene);
  gridMat.majorUnitFrequency = 2;
  gridMat.minorUnitVisibility = 0.3;
  gridMat.gridRatio = 0.5;
  gridMat.backFaceCulling = false;
  gridMat.mainColor = new Color3(0.02, 0.02, 0.06); // #050510
  gridMat.lineColor = new Color3(0, 0.898, 0.784);   // #00e5c8
  gridMat.opacity = 0.92;
  floor.material = gridMat;
  floor.position.y = 0;

  // ── Walls ──
  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new Color3(0.027, 0.027, 0.102); // #07071a
  wallMat.emissiveColor = new Color3(0.015, 0.015, 0.06);
  wallMat.specularColor = Color3.Black();

  // Back wall
  const backWall = MeshBuilder.CreatePlane("backWall", { width: 20, height: 5 }, scene);
  backWall.position = new Vector3(0, 2.5, 5);
  backWall.material = wallMat;

  // Left wall
  const leftWall = MeshBuilder.CreatePlane("leftWall", { width: 10, height: 5 }, scene);
  leftWall.position = new Vector3(-5, 2.5, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.material = wallMat;

  // Right wall
  const rightWall = MeshBuilder.CreatePlane("rightWall", { width: 10, height: 5 }, scene);
  rightWall.position = new Vector3(5, 2.5, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.material = wallMat;

  // ── Workbench Table ──
  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.diffuseColor = new Color3(0.102, 0.102, 0.18); // #1a1a2e
  tableMat.specularColor = new Color3(0.15, 0.15, 0.2);
  tableMat.specularPower = 64;

  // Tabletop
  const tableTop = MeshBuilder.CreateBox("tableTop", { width: 4, height: 0.1, depth: 1.5 }, scene);
  tableTop.position = new Vector3(0, 0.85, 0);
  tableTop.material = tableMat;

  // Table legs
  const legMat = new StandardMaterial("legMat", scene);
  legMat.diffuseColor = new Color3(0.08, 0.08, 0.12);
  legMat.specularColor = new Color3(0.2, 0.2, 0.25);

  const legPositions = [
    new Vector3(-1.8, 0.4, -0.55),
    new Vector3(-1.8, 0.4, 0.55),
    new Vector3(1.8, 0.4, -0.55),
    new Vector3(1.8, 0.4, 0.55),
  ];

  legPositions.forEach((pos, i) => {
    const leg = MeshBuilder.CreateBox(`tableLeg${i}`, { width: 0.08, height: 0.8, depth: 0.08 }, scene);
    leg.position = pos;
    leg.material = legMat;
  });

  // ── Lighting ──

  // Main overhead point light
  const mainLight = new PointLight("mainLight", new Vector3(0, 3, 0), scene);
  mainLight.intensity = 0.8;
  mainLight.diffuse = new Color3(1, 0.98, 0.95);

  // Ambient fill
  const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.1;
  ambientLight.groundColor = new Color3(0, 0, 0.063); // #000010

  // Spot lights for dramatic effect
  const spot1 = new SpotLight("spotLight1", new Vector3(-1.5, 4, -1), new Vector3(0.3, -1, 0.2), Math.PI / 4, 2, scene);
  spot1.intensity = 0.6;
  spot1.diffuse = new Color3(0.6, 0.7, 1.0);

  const spot2 = new SpotLight("spotLight2", new Vector3(1.5, 4, -1), new Vector3(-0.3, -1, 0.2), Math.PI / 4, 2, scene);
  spot2.intensity = 0.6;
  spot2.diffuse = new Color3(0.6, 0.7, 1.0);

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
  ctx.fillStyle = "rgba(0, 10, 20, 0.6)";
  ctx.fillRect(0, 0, texRes, 64);
  ctx.font = "bold 28px monospace";
  ctx.fillStyle = "#00e5c8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, texRes / 2, 32);
  dt.update();

  const mat = new StandardMaterial(`labelMat_${text}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = new Color3(0.5, 0.5, 0.5);
  mat.specularColor = Color3.Black();
  mat.backFaceCulling = false;
  mat.useAlphaFromDiffuseTexture = true;
  labelPlane.material = mat;
}
