/**
 * SignalForge 3D — Function Generator LCD Screen Display
 * Renders a retro green LCD readout showing live parameter values
 * (frequency, amplitude, phase, decay, sampling rate) on the physical
 * hardware box screens using DynamicTexture.
 */

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SignalState } from "./signalState";

// LCD texture dimensions — matches screen plane aspect ratio
const TEX_W = 512;
const TEX_H = 160;

// Retro green LCD palette
const LCD_BG       = "#1a2e1a";   // dark green LCD background
const LCD_ACTIVE   = "#39ff60";   // bright phosphor green
const LCD_DIM      = "#1c8c2a";   // dimmer segment color for inactive area
const LCD_SCANLINE = "rgba(0,0,0,0.18)"; // subtle scanline tint

/**
 * Renders a retro green LCD display on a Function Generator screen mesh.
 * isSignal2 = true renders the FG2 (top generator) layout (fewer params, bigger text).
 */
export class FuncGenDisplay {
  private texture: DynamicTexture;
  private material: StandardMaterial;

  constructor(scene: Scene, screenMesh: Mesh, isSignal2: boolean) {
    this.texture = new DynamicTexture(
      isSignal2 ? "fg2LcdTex" : "fg1LcdTex",
      { width: TEX_W, height: TEX_H },
      scene,
      false
    );
    this.texture.hasAlpha = false;

    this.material = new StandardMaterial(
      isSignal2 ? "fg2LcdMat" : "fg1LcdMat",
      scene
    );
    this.material.diffuseTexture = this.texture;
    // Gentle emissive glow so the screen looks lit from within
    this.material.emissiveColor = new Color3(0.04, 0.18, 0.06);
    this.material.specularColor = Color3.Black();
    this.material.backFaceCulling = false;
    screenMesh.material = this.material;
  }

  /** Call this every frame / state change to repaint the screen */
  update(state: SignalState, isSignal2: boolean = false): void {
    const ctx = this.texture.getContext() as unknown as CanvasRenderingContext2D;

    // ── Background ──
    ctx.fillStyle = LCD_BG;
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    // ── Subtle scanlines for authenticity ──
    ctx.fillStyle = LCD_SCANLINE;
    for (let y = 0; y < TEX_H; y += 4) {
      ctx.fillRect(0, y, TEX_W, 2);
    }

    // ── Horizontal rule separating header from values ──
    ctx.strokeStyle = LCD_DIM;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 30);
    ctx.lineTo(TEX_W - 8, 30);
    ctx.stroke();

    if (isSignal2) {
      this._drawFG2(ctx, state);
    } else {
      this._drawFG1(ctx, state);
    }

    this.texture.update();
  }

  // ──────────────────────────────────────────────
  // Generator 1 (Bottom) — full layout with 5 params
  // ──────────────────────────────────────────────
  private _drawFG1(ctx: CanvasRenderingContext2D, state: SignalState): void {
    const p = state.params;
    const typeName = this._signalTypeName(state.type);

    // Header: device title + signal type
    ctx.font = "bold 15px monospace";
    ctx.fillStyle = LCD_DIM;
    ctx.textAlign = "left";
    ctx.fillText("FUNC GEN  1", 10, 21);

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = LCD_ACTIVE;
    ctx.textAlign = "right";
    ctx.fillText(typeName, TEX_W - 10, 21);

    // ── Row 1: AMP and FREQ ──
    const row1Y = 60;
    this._drawParam(ctx,  "AMP",  `${p.A.toFixed(3)} V`,  10,        row1Y);
    this._drawParam(ctx, "FREQ",  `${p.f.toFixed(3)} Hz`, TEX_W / 2 + 8, row1Y);

    // ── Row 2: PHASE and DECAY ──
    const row2Y = 102;
    this._drawParam(ctx, "PHAS",  `${p.phi.toFixed(3)} r`,  10,        row2Y);
    this._drawParam(ctx, "DECY",  `${p.alpha.toFixed(3)}`,  TEX_W / 2 + 8, row2Y);

    // ── Row 3: Sampling rate (only when discrete mode is on) ──
    const row3Y = 142;
    if (state.discrete) {
      this._drawParam(ctx, "SMPL", `Ts=${state.Ts.toFixed(3)}s`, 10, row3Y);
    } else {
      ctx.font = "11px monospace";
      ctx.fillStyle = LCD_DIM;
      ctx.textAlign = "left";
      ctx.fillText("CONT MODE", 10, row3Y);
    }

    // ── Discrete indicator badge ──
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = state.discrete ? LCD_ACTIVE : LCD_DIM;
    ctx.textAlign = "right";
    ctx.fillText(state.discrete ? "[ DISCRETE ]" : "[  ANALOG  ]", TEX_W - 10, row3Y);
  }

  // ──────────────────────────────────────────────
  // Generator 2 (Top) — compact layout with 3 params
  // ──────────────────────────────────────────────
  private _drawFG2(ctx: CanvasRenderingContext2D, state: SignalState): void {
    const p = state.signal2Params;
    const typeName = this._signalTypeName(state.signal2Type);

    // Header
    ctx.font = "bold 15px monospace";
    ctx.fillStyle = LCD_DIM;
    ctx.textAlign = "left";
    ctx.fillText("FUNC GEN  2", 10, 21);

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = LCD_ACTIVE;
    ctx.textAlign = "right";
    ctx.fillText(typeName, TEX_W - 10, 21);

    // 3 params in a wide single row to fill the slightly smaller FG2 screen
    const rowY = 72;
    this._drawParam(ctx, "AMP",  `${p.A.toFixed(3)} V`,   10,                 rowY);
    this._drawParam(ctx, "FREQ", `${p.f.toFixed(3)} Hz`,   TEX_W / 3 + 8,     rowY);
    this._drawParam(ctx, "PHAS", `${p.phi.toFixed(3)} r`,  2 * TEX_W / 3 + 8, rowY);

    // Small status line
    ctx.font = "11px monospace";
    ctx.fillStyle = LCD_DIM;
    ctx.textAlign = "left";
    ctx.fillText("CH2 OUTPUT", 10, 132);

    ctx.textAlign = "right";
    ctx.fillText("SIGFORGE-3D", TEX_W - 10, 132);
  }

  // ──────────────────────────────────────────────
  // Shared helper: draw one labeled parameter block
  // ──────────────────────────────────────────────
  private _drawParam(
    ctx: CanvasRenderingContext2D,
    label: string,
    value: string,
    x: number,
    y: number
  ): void {
    // Label (dim)
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = LCD_DIM;
    ctx.textAlign = "left";
    ctx.fillText(label, x, y - 14);

    // Value (bright) with a glow shadow
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = LCD_ACTIVE;
    ctx.shadowColor = LCD_ACTIVE;
    ctx.shadowBlur = 6;
    ctx.textAlign = "left";
    ctx.fillText(value, x, y);
    ctx.shadowBlur = 0;
  }

  // ──────────────────────────────────────────────
  // Map internal signal type key → display label
  // ──────────────────────────────────────────────
  private _signalTypeName(type: string): string {
    const names: Record<string, string> = {
      sine:    "~SINE",
      step:    "STEP",
      impulse: "IMPL",
      ramp:    "RAMP",
      exp:     "EXP",
    };
    return names[type] ?? type.toUpperCase();
  }
}
