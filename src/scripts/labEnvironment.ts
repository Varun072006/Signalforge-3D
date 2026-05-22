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
import { Animation } from "@babylonjs/core/Animations/animation";
import { ExponentialEase, EasingFunction } from "@babylonjs/core/Animations/easing";

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
  wallMat.diffuseColor = new Color3(0.92, 0.92, 0.94); // Off-white/light gray cinderblock tone
  wallMat.specularColor = new Color3(0.05, 0.05, 0.05);

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

  // ── Workbench Table (Industrial Lab Bench) ──
  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.diffuseColor = new Color3(0.1, 0.1, 0.15); // Black epoxy resin top
  tableMat.specularColor = new Color3(0.3, 0.3, 0.35);
  tableMat.specularPower = 32;

  // Tabletop (Thicker, heavier)
  const tableTop = MeshBuilder.CreateBox("tableTop", { width: 6.5, height: 0.15, depth: 3 }, scene);
  tableTop.position = new Vector3(0, 0.85, 0);
  tableTop.material = tableMat;

  // Table legs (Heavy dark metal)
  const legMat = new StandardMaterial("legMat", scene);
  legMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
  legMat.specularColor = new Color3(0.3, 0.3, 0.3);

  const legPositions = [
    new Vector3(-3.0, 0.4, -1.2),
    new Vector3(-3.0, 0.4, 1.2),
    new Vector3(3.0, 0.4, -1.2),
    new Vector3(3.0, 0.4, 1.2),
  ];

  legPositions.forEach((pos, i) => {
    const leg = MeshBuilder.CreateBox(`tableLeg${i}`, { width: 0.15, height: 0.8, depth: 0.15 }, scene);
    leg.position = pos;
    leg.material = legMat;
  });

  // Baseboards (Dark Gray Trim)
  const trimMat = new StandardMaterial("trimMat", scene);
  trimMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
  const backTrim = MeshBuilder.CreateBox("backTrim", { width: 30, height: 0.2, depth: 0.1 }, scene);
  backTrim.position = new Vector3(0, 0.1, 7.95);
  backTrim.material = trimMat;

  // ── Scientist Posters & Whiteboard (Dynamic Textures) ──
  createScientistPoster(scene, "Joseph Fourier", "Mathematics is the\nlanguage of nature.", new Vector3(-4, 4, 7.95));
  createWhiteboard(scene, new Vector3(0, 4, 7.95));
  createScientistPoster(scene, "Harry Nyquist", "Information is measured\nby its bandwidth.", new Vector3(4, 4, 7.95));

  // ── Lighting ──
  // Main overhead point light (Pool of light on the table)
  const mainLight = new PointLight("mainLight", new Vector3(0, 4.5, 1), scene);
  mainLight.intensity = 1.0;
  mainLight.diffuse = new Color3(1.0, 0.98, 0.98); // Slightly warm lab light

  // Ambient fill
  const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.3; // Lower ambient for moody realism
  ambientLight.groundColor = new Color3(0.5, 0.5, 0.5);

  // Spot lights for dramatic effect
  const spot1 = new SpotLight("spotLight1", new Vector3(-1.5, 4, -1), new Vector3(0.3, -1, 0.2), Math.PI / 3, 4, scene);
  spot1.intensity = 0.5;
  spot1.diffuse = new Color3(1.0, 0.9, 0.9);

  // ── Axis Labels ──
  createAxisLabel(scene, "Z — TIME (t)", new Vector3(0, 1.45, 0.5), 0);
  createAxisLabel(scene, "Y — AMPLITUDE x(t)", new Vector3(-3.2, 2.8, 0), Math.PI / 2);

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
  ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
  ctx.fillRect(0, 0, texRes, 64);
  ctx.font = "bold 32px monospace";
  ctx.fillStyle = "#cc0000";
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

function createScientistPoster(scene: Scene, name: string, quote: string, position: Vector3): void {
  const width = 2;
  const height = 2.5;
  const poster = MeshBuilder.CreatePlane(`poster_${name}`, { width, height }, scene);
  poster.position = position;

  const resW = 1024;
  const resH = 1280;
  const dt = new DynamicTexture(`dt_poster_${name}`, { width: resW, height: resH }, scene, false);
  const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
  
  // Outer frame (Dark Wood)
  ctx.fillStyle = "#2a1e12";
  ctx.fillRect(0, 0, resW, resH);
  
  // Inner mat (Off-white)
  ctx.fillStyle = "#f4f1ea";
  ctx.fillRect(40, 40, resW - 80, resH - 80);
  
  // Name
  ctx.font = "bold 100px Georgia, serif";
  ctx.fillStyle = "#222222";
  ctx.textAlign = "center";
  ctx.fillText(name, resW / 2, 850);
  
  // Quote
  ctx.font = "italic 72px Georgia, serif";
  ctx.fillStyle = "#555555";
  const lines = quote.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(`"${line}"`, resW / 2, 1000 + (i * 90));
  });
  
  dt.update();

  const mat = new StandardMaterial(`mat_poster_${name}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = new Color3(0.5, 0.5, 0.5); // Boost brightness
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  poster.material = mat;

  // Add the actual generated image on a plane slightly in front
  const photo = MeshBuilder.CreatePlane(`photo_${name}`, { width: 1.5, height: 1.2 }, scene);
  photo.position = new Vector3(position.x, position.y + 0.35, position.z - 0.01);
  const photoMat = new StandardMaterial(`photoMat_${name}`, scene);
  const photoName = name.toLowerCase().includes("fourier") ? "fourier.png" : "nyquist.png";
  const tex = new Texture(`/images/${photoName}`, scene, false, false);
  photoMat.diffuseTexture = tex;
  photoMat.emissiveColor = new Color3(0.3, 0.3, 0.3); // Brightness boost
  photo.material = photoMat;
}

function createWhiteboard(scene: Scene, position: Vector3): void {
  const width = 4;
  const height = 2.5;
  const board = MeshBuilder.CreatePlane("whiteboard", { width, height }, scene);
  board.position = position;

  const resW = 2048;
  const resH = 1280;
  const dt = new DynamicTexture("dt_whiteboard", { width: resW, height: resH }, scene, false);
  const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
  
  // Aluminum Frame
  ctx.fillStyle = "#cccccc";
  ctx.fillRect(0, 0, resW, resH);
  
  // Whiteboard Surface
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(20, 20, resW - 40, resH - 40);
  
  // Marker text - Title
  ctx.font = "bold 120px 'Comic Sans MS', cursive, sans-serif";
  ctx.fillStyle = "#1111aa"; // blue marker
  ctx.fillText("EXPERIMENT: Signal Representation", 80, 160);
  
  // Marker text - Body
  ctx.font = "80px 'Comic Sans MS', cursive, sans-serif";
  ctx.fillStyle = "#111111"; // black marker
  ctx.fillText("1. Understand Basic Signals", 80, 320);
  ctx.fillText("2. Analyze Signal Products", 80, 480);
  ctx.fillText("3. Test Orthogonality", 80, 640);
  
  ctx.fillStyle = "#aa1111"; // red marker
  ctx.fillText("Important: Use the physical Function", 80, 850);
  ctx.fillText("Generators to tune signals!", 80, 960);
  
  // Draw some math on board
  ctx.fillStyle = "#111111";
  ctx.font = "italic 100px serif";
  ctx.fillText("x(t) = A·sin(2πft + φ)", 1000, 420);
  ctx.fillText("y(t) = x1(t) · x2(t)", 1000, 580);
  
  dt.update();

  const mat = new StandardMaterial("mat_whiteboard", scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = new Color3(0.6, 0.6, 0.6); // Boost brightness
  mat.specularColor = new Color3(0.5, 0.5, 0.5); // somewhat glossy
  board.material = mat;
}

export type CameraViewPreset = 'WIDE' | 'FG1' | 'FG2' | 'OSC';

export function transitionCameraTo(
  camera: ArcRotateCamera,
  preset: CameraViewPreset,
  onComplete?: () => void
): void {
  const scene = camera.getScene();
  
  // Detach control temporarily to prevent input fight
  const canvas = scene.getEngine().getRenderingCanvas();
  if (canvas) {
    camera.detachControl();
  }

  let targetVal: Vector3;
  let alphaVal: number;
  let betaVal: number;
  let radiusVal: number;

  switch (preset) {
    case 'FG1':
      targetVal = new Vector3(-1.2, 1.1, -0.15);
      alphaVal = -Math.PI / 2;
      betaVal = Math.PI / 2.1;
      radiusVal = 1.8;
      break;
    case 'FG2':
      targetVal = new Vector3(-1.2, 1.65, -0.15);
      alphaVal = -Math.PI / 2;
      betaVal = Math.PI / 2.1;
      radiusVal = 1.8;
      break;
    case 'OSC':
      targetVal = new Vector3(1.2, 1.15, -0.15);
      alphaVal = -Math.PI / 2;
      betaVal = Math.PI / 2.1;
      radiusVal = 1.9;
      break;
    case 'WIDE':
    default:
      targetVal = new Vector3(0, 0.85, 0);
      alphaVal = -Math.PI / 2;
      betaVal = Math.PI / 2.5;
      radiusVal = 7;
      break;
  }

  // Ensure alpha is kept close to -Math.PI / 2 to avoid winding spins
  const alphaValNormalized = alphaVal;
  const diff = camera.alpha - alphaValNormalized;
  const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
  camera.alpha = alphaValNormalized + normalizedDiff;

  const fps = 60;
  const duration = 0.45; // 450ms
  const totalFrames = fps * duration;

  // We animate target, alpha, beta, radius
  const animTarget = new Animation("camTarget", "target", fps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
  animTarget.setKeys([
    { frame: 0, value: camera.target.clone() },
    { frame: totalFrames, value: targetVal }
  ]);

  const animAlpha = new Animation("camAlpha", "alpha", fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
  animAlpha.setKeys([
    { frame: 0, value: camera.alpha },
    { frame: totalFrames, value: alphaVal }
  ]);

  const animBeta = new Animation("camBeta", "beta", fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
  animBeta.setKeys([
    { frame: 0, value: camera.beta },
    { frame: totalFrames, value: betaVal }
  ]);

  const animRadius = new Animation("camRadius", "radius", fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
  animRadius.setKeys([
    { frame: 0, value: camera.radius },
    { frame: totalFrames, value: radiusVal }
  ]);

  // Easing function
  const ease = new ExponentialEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  animTarget.setEasingFunction(ease);
  animAlpha.setEasingFunction(ease);
  animBeta.setEasingFunction(ease);
  animRadius.setEasingFunction(ease);

  camera.animations = [animTarget, animAlpha, animBeta, animRadius];

  scene.beginAnimation(camera, 0, totalFrames, false, 1.0, () => {
    // Re-attach control when done
    if (canvas) {
      camera.attachControl(canvas, true);
    }
    if (onComplete) {
      onComplete();
    }
  });
}
