/**
 * SignalForge 3D — Holographic Wave Renderer
 * Renders a glowing 3D waveform floating above the workbench.
 * Supports continuous (LineSystem) and discrete (stem plot) modes.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { SignalState } from "./signalState";
import { computeSignal, clampSignal } from "./signalEngine";

// Coordinate mapping constants
const T_MIN = -3;
const T_MAX = 10;
const T_RANGE = T_MAX - T_MIN;
const X_MIN = -2.5;
const X_MAX = 2.5;
const X_RANGE = X_MAX - X_MIN;
const Y_BASE = 2.0;       // Hologram floats at y=2.0
const Y_SCALE = 0.4;      // Amplitude scaling
const SAMPLE_STEP = 0.04; // ~325 points

/** Maps t to x position */
function tToX(t: number): number {
  return X_MIN + ((t - T_MIN) / T_RANGE) * X_RANGE;
}

export class HolographicWaveRenderer {
  private scene: Scene;
  private waveMeshes: (Mesh | LinesMesh)[] = [];
  private stemMeshes: Mesh[] = [];
  private tickMeshes: Mesh[] = [];
  private originLine: Mesh | null = null;
  private adaptiveSamples = false;

  // Shadow wave for challenge mode
  private shadowMeshes: (Mesh | LinesMesh)[] = [];

  // Overlay wave
  private overlayMeshes: (Mesh | LinesMesh)[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.buildTimeAxis();
    this.buildOriginMarker();
  }

  /** Toggle adaptive sampling for low-perf devices */
  setAdaptive(on: boolean): void {
    this.adaptiveSamples = on;
  }

  /** Main render call — disposes old meshes, creates new ones */
  render(state: SignalState): void {
    this.disposeArray(this.waveMeshes);
    this.disposeArray(this.stemMeshes);

    if (!state.cableConnected) return;

    if (state.discrete) {
      this.renderDiscrete(state);
    } else {
      this.renderContinuous(state);
    }
  }

  /** Render the shadow wave for challenge mode */
  renderShadow(visible: boolean): void {
    this.disposeArray(this.shadowMeshes);
    if (!visible) return;

    // Fixed params: exponential with A=1.0, alpha=-1.5
    const step = this.adaptiveSamples ? 0.08 : SAMPLE_STEP;
    const points: Vector3[] = [];
    const colors: Color4[] = [];
    const shadowColor = new Color4(0.655, 0.545, 0.98, 0.4); // #a78bfa at 40%

    for (let t = T_MIN; t <= T_MAX; t += step) {
      const v = t >= 0 ? 1.0 * Math.exp(-1.5 * t) : 0;
      const clamped = clampSignal(v, -3, 3);
      points.push(new Vector3(tToX(t), clamped * Y_SCALE + Y_BASE, 0.2));
      colors.push(shadowColor);
    }

    if (points.length > 1) {
      const line = MeshBuilder.CreateLines("shadowWave", {
        points,
        colors,
        updatable: false,
      }, this.scene);
      this.shadowMeshes.push(line);

      // Glow pass
      const glowColors = colors.map(() => new Color4(0.655, 0.545, 0.98, 0.15));
      const glowLine = MeshBuilder.CreateLines("shadowWaveGlow", {
        points,
        colors: glowColors,
        updatable: false,
      }, this.scene);
      this.shadowMeshes.push(glowLine);
    }
  }

  /** Render overlay (second signal) */
  renderOverlay(state: SignalState): void {
    this.disposeArray(this.overlayMeshes);
    if (!state.overlayActive) return;

    // Opposite signal type for contrast
    const overlayType = state.type === 'sine' ? 'step' : 'sine';
    const overlayParams = { ...state.params, A: state.params.A * 0.7 };
    const step = this.adaptiveSamples ? 0.08 : SAMPLE_STEP;
    const points: Vector3[] = [];
    const colors: Color4[] = [];
    const overlayColor = new Color4(0.1, 0.4, 0.9, 0.8); // Blue

    for (let t = T_MIN; t <= T_MAX; t += step) {
      const v = computeSignal(overlayType, t, overlayParams);
      const clamped = clampSignal(v, -3, 3);
      points.push(new Vector3(tToX(t), clamped * Y_SCALE + Y_BASE, -0.3));
      colors.push(overlayColor);
    }

    if (points.length > 1) {
      const line = MeshBuilder.CreateLines("overlayWave", {
        points,
        colors,
        updatable: false,
      }, this.scene);
      this.overlayMeshes.push(line);
    }
  }

  // ── Private renderers ──

  private renderContinuous(state: SignalState): void {
    const step = this.adaptiveSamples ? 0.08 : SAMPLE_STEP;
    const points: Vector3[] = [];
    const colors: Color4[] = [];
    const waveColor = new Color4(0.88, 0.12, 0.12, 1); // #e02020 (Red)

    for (let t = T_MIN; t <= T_MAX; t += step) {
      const v = computeSignal(state.type, t, state.params);
      const clamped = clampSignal(v, -3, 3);
      points.push(new Vector3(tToX(t), clamped * Y_SCALE + Y_BASE, 0));
      colors.push(waveColor);
    }

    if (points.length > 1) {
      // Main wave line
      const waveLine = MeshBuilder.CreateLines("holoWave", {
        points,
        colors,
        updatable: false,
      }, this.scene);
      this.waveMeshes.push(waveLine);

      // Glow pass (wider, lower alpha)
      const glowColors = points.map(() => new Color4(0.88, 0.12, 0.12, 0.3));
      const glowLine = MeshBuilder.CreateLines("holoWaveGlow", {
        points,
        colors: glowColors,
        updatable: false,
      }, this.scene);
      this.waveMeshes.push(glowLine);
    }
  }

  private renderDiscrete(state: SignalState): void {
    const stemMat = new StandardMaterial("stemMat", this.scene);
    stemMat.diffuseColor = new Color3(0.88, 0.12, 0.12);
    stemMat.emissiveColor = new Color3(0.6, 0.1, 0.1);
    stemMat.specularColor = Color3.Black();

    const tipMat = new StandardMaterial("tipMat", this.scene);
    tipMat.diffuseColor = new Color3(1.0, 0.2, 0.2);
    tipMat.emissiveColor = new Color3(0.8, 0.1, 0.1);

    const Ts = state.Ts;
    const nStart = Math.ceil(T_MIN / Ts);
    const nEnd = Math.floor(T_MAX / Ts);

    for (let n = nStart; n <= nEnd; n++) {
      const t = n * Ts;
      const v = computeSignal(state.type, t, state.params);
      const clamped = clampSignal(v, -3, 3);
      const x = tToX(t);
      const yTop = clamped * Y_SCALE + Y_BASE;
      const yBot = Y_BASE;
      const height = Math.abs(yTop - yBot);

      if (height > 0.001) {
        // Stem
        const stem = MeshBuilder.CreateCylinder(`stem_${n}`, {
          diameter: 0.015,
          height: height,
        }, this.scene);
        stem.position = new Vector3(x, (yTop + yBot) / 2, 0);
        stem.material = stemMat;
        this.stemMeshes.push(stem);
      }

      // Tip sphere
      const tip = MeshBuilder.CreateSphere(`tip_${n}`, { diameter: 0.04 }, this.scene);
      tip.position = new Vector3(x, yTop, 0);
      tip.material = tipMat;
      this.stemMeshes.push(tip);
    }
  }

  // ── Time axis tick marks ──

  private buildTimeAxis(): void {
    const tickMat = new StandardMaterial("tickMat", this.scene);
    tickMat.diffuseColor = new Color3(0.3, 0.3, 0.4);
    tickMat.emissiveColor = new Color3(0.15, 0.15, 0.2);
    tickMat.specularColor = Color3.Black();

    const tickValues = [0, 2, 4, 6, 8, 10];
    tickValues.forEach(t => {
      const x = tToX(t);

      // Tick mark
      const tick = MeshBuilder.CreateBox(`tick_${t}`, { width: 0.02, height: 0.1, depth: 0.01 }, this.scene);
      tick.position = new Vector3(x, 1.7, 0);
      tick.material = tickMat;
      this.tickMeshes.push(tick);

      // Tick label
      const labelPlane = MeshBuilder.CreatePlane(`tickLabel_${t}`, { width: 0.12, height: 0.06 }, this.scene);
      labelPlane.position = new Vector3(x, 1.6, 0);
      labelPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

      const dt = new DynamicTexture(`dt_tick_${t}`, { width: 64, height: 32 }, this.scene, false);
      dt.hasAlpha = true;
      const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, 64, 32);
      ctx.font = "bold 18px monospace";
      ctx.fillStyle = t === 0 ? "#cc0000" : "#333333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`t=${t}`, 32, 16);
      dt.update();

      const mat = new StandardMaterial(`tickLblMat_${t}`, this.scene);
      mat.diffuseTexture = dt;
      mat.emissiveColor = new Color3(0.1, 0.1, 0.1);
      mat.specularColor = Color3.Black();
      mat.backFaceCulling = false;
      mat.useAlphaFromDiffuseTexture = true;
      labelPlane.material = mat;
      this.tickMeshes.push(labelPlane);
    });
  }

  // ── Origin marker ──

  private buildOriginMarker(): void {
    const mat = new StandardMaterial("originMat", this.scene);
    mat.diffuseColor = new Color3(0.8, 0.1, 0.1);
    mat.emissiveColor = new Color3(0.5, 0.1, 0.1);
    mat.specularColor = Color3.Black();
    mat.alpha = 0.6;

    const originX = tToX(0);
    const line = MeshBuilder.CreateBox("originMarker", { width: 0.01, height: 0.6, depth: 0.01 }, this.scene);
    line.position = new Vector3(originX, 2.0, 0);
    line.material = mat;
    this.originLine = line;
  }

  // ── Cleanup ──

  private disposeArray(arr: (Mesh | LinesMesh)[]): void {
    arr.forEach(m => {
      if (m && !m.isDisposed()) {
        m.dispose();
      }
    });
    arr.length = 0;
  }

  dispose(): void {
    this.disposeArray(this.waveMeshes);
    this.disposeArray(this.stemMeshes);
    this.disposeArray(this.shadowMeshes);
    this.disposeArray(this.overlayMeshes);
    this.disposeArray(this.tickMeshes);
    if (this.originLine) this.originLine.dispose();
  }
}
