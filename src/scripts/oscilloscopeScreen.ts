/**
 * SignalForge 3D — Oscilloscope Screen Display
 * Renders signal equation and mini waveform trace on the CRT screen
 * using a DynamicTexture.
 */

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SignalState } from "./signalState";
import { computeSignal, getSignalDisplayName, getEquationString } from "./signalEngine";

const TEX_W = 512;
const TEX_H = 340;

export class OscilloscopeDisplay {
  private scene: Scene;
  private screenMesh: Mesh;
  private texture: DynamicTexture;
  private material: StandardMaterial;

  constructor(scene: Scene, screenMesh: Mesh) {
    this.scene = scene;
    this.screenMesh = screenMesh;

    // Create reusable DynamicTexture
    this.texture = new DynamicTexture("oscDT", { width: TEX_W, height: TEX_H }, scene, false);
    this.texture.hasAlpha = false;

    this.material = new StandardMaterial("oscScreenMat", scene);
    this.material.diffuseTexture = this.texture;
    this.material.emissiveColor = new Color3(0, 0.25, 0.05);
    this.material.specularColor = Color3.Black();
    this.material.backFaceCulling = false;
    this.screenMesh.material = this.material;
  }

  /** Update the oscilloscope display with current signal state */
  update(state: SignalState, overlayType?: string): void {
    const ctx = this.texture.getContext() as unknown as CanvasRenderingContext2D;

    // ── Background ──
    ctx.fillStyle = "#001a00";
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    // ── CRT scanline effect ──
    ctx.strokeStyle = "rgba(0, 40, 0, 0.3)";
    ctx.lineWidth = 1;
    for (let y = 0; y < TEX_H; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(TEX_W, y);
      ctx.stroke();
    }

    // ── Grid lines ──
    ctx.strokeStyle = "rgba(0, 80, 0, 0.25)";
    ctx.lineWidth = 1;
    // Vertical grid
    for (let x = 0; x < TEX_W; x += TEX_W / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, TEX_H);
      ctx.stroke();
    }
    // Horizontal grid
    for (let y = 0; y < TEX_H; y += TEX_H / 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(TEX_W, y);
      ctx.stroke();
    }

    // ── Mini waveform trace ──
    if (state.activeTask === "Signal Product") {
      // Draw Signal 1 (dashed)
      this.drawTrace(ctx, state.type, state.params, "#ffaa00", TEX_H * 0.35, TEX_H * 0.55, true);
      // Draw Signal 2 (dashed)
      this.drawTrace(ctx, state.signal2Type, state.signal2Params, "#00aaff", TEX_H * 0.35, TEX_H * 0.55, true);
      
      // Draw Product (solid blue/purple)
      const productFn = (t: number) => {
        const v1 = computeSignal(state.type, t, state.params);
        const v2 = computeSignal(state.signal2Type, t, state.signal2Params);
        return v1 * v2;
      };
      this.drawCustomTrace(ctx, productFn, "#bb00ff", TEX_H * 0.35, TEX_H * 0.55);
      
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = "#bb00ff";
      ctx.textAlign = "center";
      ctx.fillText("PRODUCT", TEX_W / 2, 32);
    } else {
      this.drawTrace(ctx, state.type, state.params, "#00ff41", TEX_H * 0.35, TEX_H * 0.55);

      // ── Overlay trace if active ──
      if (overlayType) {
        const overlayParams = { ...state.params, A: state.params.A * 0.7 };
        this.drawTrace(ctx, overlayType, overlayParams, "#ff6b6b", TEX_H * 0.35, TEX_H * 0.55);
      }
      
      ctx.font = "bold 28px monospace";
      ctx.fillStyle = "#00ff41";
      ctx.textAlign = "center";
      ctx.fillText(getSignalDisplayName(state.type), TEX_W / 2, 32);
      
      ctx.font = "16px monospace";
      ctx.fillStyle = "#00cc33";
      ctx.fillText(getEquationString(state.type, state.params), TEX_W / 2, 58);
    }

    // ── Amplitude axis labels ──
    ctx.font = "11px monospace";
    ctx.fillStyle = "#006622";
    ctx.textAlign = "right";
    ctx.fillText("+A", TEX_W - 8, TEX_H * 0.38);
    ctx.fillText(" 0", TEX_W - 8, TEX_H * 0.55);
    ctx.fillText("-A", TEX_W - 8, TEX_H * 0.72);

    // ── Parameter readout ──
    ctx.font = "13px monospace";
    ctx.fillStyle = "#008833";
    ctx.textAlign = "left";
    const yStart = TEX_H * 0.82;
    ctx.fillText(`A=${state.params.A.toFixed(2)}  f=${state.params.f.toFixed(2)}Hz`, 12, yStart);
    ctx.fillText(`phi=${state.params.phi.toFixed(2)}rad  a=${state.params.alpha.toFixed(2)}`, 12, yStart + 18);
    if (state.discrete) {
      ctx.fillText(`Ts=${state.Ts.toFixed(3)}s`, 12, yStart + 36);
    }

    this.texture.update();
  }

  private drawTrace(
    ctx: CanvasRenderingContext2D,
    type: string,
    params: { A: number; f: number; phi: number; alpha: number },
    color: string,
    yCenter: number,
    yRange: number,
    dashed: boolean = false
  ): void {
    const fn = (t: number) => computeSignal(type, t, params);
    this.drawCustomTrace(ctx, fn, color, yCenter, yRange, dashed, params.A);
  }

  private drawCustomTrace(
    ctx: CanvasRenderingContext2D,
    fn: (t: number) => number,
    color: string,
    yCenter: number,
    yRange: number,
    dashed: boolean = false,
    baseA: number = 1
  ): void {
    const numSamples = 80;
    const tMin = -1;
    const tMax = 5;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    
    if (dashed) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.beginPath();

    for (let i = 0; i <= numSamples; i++) {
      const t = tMin + (i / numSamples) * (tMax - tMin);
      const v = fn(t);
      const clamped = Math.max(-2, Math.min(2, v));

      const px = (i / numSamples) * TEX_W;
      const py = yCenter - (clamped / (baseA || 1)) * yRange * 0.35;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]); // reset
  }
}
