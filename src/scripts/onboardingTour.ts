/**
 * SignalForge 3D — Onboarding Tour
 * 5-step guided holographic tooltip sequence that runs on first launch.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Animation } from "@babylonjs/core/Animations/animation";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

interface TourStep {
  position: Vector3;
  text: string;
  durationMs: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    position: new Vector3(-1.2, 1.8, -0.5),
    text: "This is your Signal Source.\nSelect a signal type from\nthe hub on the left.",
    durationMs: 3500,
  },
  {
    position: new Vector3(0, 2.6, -0.3),
    text: "This wave shows your signal\nin 3D time-amplitude space.\nZ-axis = time.",
    durationMs: 3500,
  },
  {
    position: new Vector3(-1.3, 1.4, -0.5),
    text: "Grab these knobs to change\nAmplitude, Frequency, and\nPhase in real time.",
    durationMs: 3500,
  },
  {
    position: new Vector3(1.2, 1.7, -0.5),
    text: "The oscilloscope shows the\nlive equation and waveform\ntrace.",
    durationMs: 3500,
  },
  {
    position: new Vector3(0, 2.2, -0.5),
    text: "Try Challenge Mode to test\nyour understanding!",
    durationMs: 2500,
  },
];

export function runOnboardingTour(scene: Scene): void {
  let currentStep = 0;
  let tooltipPlane: Mesh | null = null;
  let arrowMesh: Mesh | null = null;
  let skipBtn: Mesh | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  // ── Skip Button ──
  const skipBtnMat = new StandardMaterial("skipBtnMat", scene);
  skipBtnMat.diffuseColor = new Color3(0.2, 0.05, 0.05);
  skipBtnMat.emissiveColor = new Color3(0.15, 0.03, 0.03);
  skipBtnMat.specularColor = Color3.Black();

  skipBtn = MeshBuilder.CreateBox("skipTourBtn", { width: 0.3, height: 0.08, depth: 0.02 }, scene);
  skipBtn.position = new Vector3(0, 3.2, -1);
  skipBtn.billboardMode = Mesh.BILLBOARDMODE_ALL;
  skipBtn.material = skipBtnMat;

  const skipDT = new DynamicTexture("skipDT", { width: 128, height: 32 }, scene, false);
  skipDT.hasAlpha = true;
  const sCtx = skipDT.getContext() as unknown as CanvasRenderingContext2D;
  sCtx.clearRect(0, 0, 128, 32);
  sCtx.font = "bold 16px monospace";
  sCtx.fillStyle = "#ff6b6b";
  sCtx.textAlign = "center";
  sCtx.textBaseline = "middle";
  sCtx.fillText("SKIP TOUR", 64, 16);
  skipDT.update();

  const skipLblMat = new StandardMaterial("skipLblMat", scene);
  skipLblMat.diffuseTexture = skipDT;
  skipLblMat.emissiveColor = new Color3(0.4, 0.15, 0.15);
  skipLblMat.specularColor = Color3.Black();
  skipLblMat.backFaceCulling = false;
  skipLblMat.useAlphaFromDiffuseTexture = true;

  const skipLbl = MeshBuilder.CreatePlane("skipTourLbl", { width: 0.28, height: 0.06 }, scene);
  skipLbl.position = new Vector3(0, 3.2, -1.01);
  skipLbl.billboardMode = Mesh.BILLBOARDMODE_ALL;
  skipLbl.material = skipLblMat;

  skipBtn.actionManager = new ActionManager(scene);
  skipBtn.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      cancelled = true;
      cleanup();
    })
  );

  function showStep(index: number): void {
    if (cancelled || index >= TOUR_STEPS.length) {
      cleanup();
      return;
    }

    const step = TOUR_STEPS[index];

    // Clean previous tooltip
    if (tooltipPlane) {
      tooltipPlane.dispose();
      tooltipPlane = null;
    }
    if (arrowMesh) {
      arrowMesh.dispose();
      arrowMesh = null;
    }

    // Create tooltip plane
    tooltipPlane = MeshBuilder.CreatePlane("tourTooltip", { width: 1.0, height: 0.4 }, scene);
    tooltipPlane.position = step.position.clone();
    tooltipPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const dt = new DynamicTexture("tourDT", { width: 512, height: 200 }, scene, false);
    dt.hasAlpha = true;
    const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;

    // Background
    ctx.fillStyle = "rgba(3, 3, 20, 0.9)";
    ctx.fillRect(0, 0, 512, 200);

    // Animated border
    ctx.strokeStyle = "#00e5c8";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 504, 192);

    // Step number
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#00e5c8";
    ctx.textAlign = "left";
    ctx.fillText(`STEP ${index + 1} / ${TOUR_STEPS.length}`, 16, 24);

    // Text
    ctx.font = "18px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    const lines = step.text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 256, 70 + i * 28);
    });

    dt.update();

    const mat = new StandardMaterial("tourMat", scene);
    mat.diffuseTexture = dt;
    mat.emissiveColor = new Color3(0.4, 0.4, 0.45);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    tooltipPlane.material = mat;

    // Scale-up animation
    tooltipPlane.scaling = Vector3.Zero();
    const scaleAnim = new Animation("tooltipScale", "scaling", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    scaleAnim.setKeys([
      { frame: 0, value: new Vector3(0, 0, 0) },
      { frame: 9, value: new Vector3(1.05, 1.05, 1.05) },
      { frame: 12, value: new Vector3(1, 1, 1) },
    ]);
    tooltipPlane.animations = [scaleAnim];
    scene.beginAnimation(tooltipPlane, 0, 12, false);

    // Arrow pointing down
    arrowMesh = MeshBuilder.CreateCylinder("tourArrow", { diameterTop: 0, diameterBottom: 0.06, height: 0.15 }, scene);
    arrowMesh.position = new Vector3(step.position.x, step.position.y - 0.25, step.position.z);
    arrowMesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    const arrowMat = new StandardMaterial("arrowMat", scene);
    arrowMat.diffuseColor = new Color3(0, 0.898, 0.784);
    arrowMat.emissiveColor = new Color3(0, 0.45, 0.4);
    arrowMat.specularColor = Color3.Black();
    arrowMesh.material = arrowMat;

    // Schedule next step
    timer = setTimeout(() => {
      currentStep++;
      showStep(currentStep);
    }, step.durationMs);
  }

  function cleanup(): void {
    if (timer) clearTimeout(timer);
    if (tooltipPlane) { tooltipPlane.dispose(); tooltipPlane = null; }
    if (arrowMesh) { arrowMesh.dispose(); arrowMesh = null; }
    if (skipBtn) { skipBtn.dispose(); skipBtn = null; }
    // Also dispose skip label
    const skipLblMesh = scene.getMeshByName("skipTourLbl");
    if (skipLblMesh) skipLblMesh.dispose();
  }

  // Start the tour
  showStep(0);
}
