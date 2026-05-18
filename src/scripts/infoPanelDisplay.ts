/**
 * SignalForge 3D — Info Panel Display
 * Floating analytics panel showing signal statistics.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { SignalState } from "./signalState";
import { getSignalDisplayName, getEquationString, isCausal, getClassification } from "./signalEngine";

const TEX_W = 400;
const TEX_H = 700;

export class InfoPanelDisplay {
  private scene: Scene;
  private panelMesh: Mesh;
  private texture: DynamicTexture;

  constructor(scene: Scene) {
    this.scene = scene;

    // Background panel
    const bgMat = new StandardMaterial("infoPanelBg", scene);
    bgMat.diffuseColor = new Color3(0.03, 0.03, 0.08);
    bgMat.specularColor = Color3.Black();

    const bg = MeshBuilder.CreateBox("infoPanelBgBox", { width: 0.85, height: 1.5, depth: 0.03 }, scene);
    bg.position = new Vector3(9.95, 2, 0);
    bg.rotation.y = -Math.PI / 2;
    bg.material = bgMat;

    // Display plane
    this.panelMesh = MeshBuilder.CreatePlane("infoPanelPlane", { width: 0.8, height: 1.4 }, scene);
    this.panelMesh.position = new Vector3(9.93, 2, 0);
    this.panelMesh.rotation.y = -Math.PI / 2;

    this.texture = new DynamicTexture("infoPanelDT", { width: TEX_W, height: TEX_H }, scene, false);
    this.texture.hasAlpha = true;

    const mat = new StandardMaterial("infoPanelMat", scene);
    mat.diffuseTexture = this.texture;
    mat.emissiveColor = new Color3(0.35, 0.35, 0.4);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    this.panelMesh.material = mat;
  }

  /** Update the info panel with current signal state */
  update(state: SignalState): void {
    const ctx = this.texture.getContext() as unknown as CanvasRenderingContext2D;

    // Clear
    ctx.clearRect(0, 0, TEX_W, TEX_H);
    ctx.fillStyle = "rgba(3, 3, 15, 0.85)";
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    // Border
    ctx.strokeStyle = "#00e5c8";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, TEX_W - 8, TEX_H - 8);

    // Header
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#00e5c8";
    ctx.textAlign = "center";
    ctx.fillText("SIGNAL ANALYTICS", TEX_W / 2, 36);

    // Divider
    ctx.strokeStyle = "#00e5c8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(TEX_W - 20, 50);
    ctx.stroke();

    // Stats
    ctx.font = "15px monospace";
    ctx.textAlign = "left";
    let y = 80;
    const lineH = 32;

    const drawRow = (label: string, value: string, color: string = "#c0c0d0") => {
      ctx.fillStyle = "#707090";
      ctx.fillText(label, 20, y);
      ctx.fillStyle = color;
      ctx.fillText(value, 200, y);
      y += lineH;
    };

    drawRow("SIGNAL TYPE:", getSignalDisplayName(state.type), "#00e5c8");
    drawRow("AMPLITUDE:", state.params.A.toFixed(2), "#ffffff");
    drawRow("FREQUENCY:", `${state.params.f.toFixed(2)} Hz`, "#ffffff");

    if (state.type === 'sine') {
      drawRow("PERIOD:", `${(1 / state.params.f).toFixed(3)} s`, "#aaaacc");
    }

    drawRow("PHASE:", `${state.params.phi.toFixed(2)} rad`, "#ffffff");

    if (state.type === 'exp') {
      drawRow("DECAY (a):", state.params.alpha.toFixed(2), "#a78bfa");
    }

    y += 8;
    drawRow("MODE:", state.discrete ? "DISCRETE" : "CONTINUOUS",
      state.discrete ? "#00e676" : "#00aa44");

    if (state.discrete) {
      const nSamples = Math.floor(13 / state.Ts);
      drawRow("SAMPLES:", `${nSamples}`, "#ffcc00");
      drawRow("Ts:", `${state.Ts.toFixed(3)} s`, "#ffcc00");
    }

    y += 8;
    drawRow("CAUSAL:", isCausal(state.type) ? "YES" : "NO",
      isCausal(state.type) ? "#00e676" : "#ff6b6b");
    drawRow("CLASS:", getClassification(state.type), "#a78bfa");

    // Equation section
    y += 16;
    ctx.strokeStyle = "#303060";
    ctx.beginPath();
    ctx.moveTo(20, y - 10);
    ctx.lineTo(TEX_W - 20, y - 10);
    ctx.stroke();

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#00e5c8";
    ctx.textAlign = "center";
    ctx.fillText("EQUATION", TEX_W / 2, y + 8);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#00ff41";
    ctx.fillText(getEquationString(state.type, state.params), TEX_W / 2, y + 32);

    // Classification theorem
    y += 56;
    ctx.font = "12px monospace";
    ctx.fillStyle = "#606080";
    ctx.textAlign = "center";

    const classInfo = getClassificationInfo(state.type);
    const lines = wrapText(classInfo, 38);
    lines.forEach((line, i) => {
      ctx.fillText(line, TEX_W / 2, y + i * 16);
    });

    this.texture.update();
  }
}

function getClassificationInfo(type: string): string {
  switch (type) {
    case 'step':
      return "Power signal: finite average power, infinite energy. P_avg = A^2/2.";
    case 'impulse':
      return "Energy signal: E = integral of |d(t)|^2 dt is finite (approx).";
    case 'ramp':
      return "Neither energy nor power: both energy and avg power diverge.";
    case 'sine':
      return "Power signal: P_avg = A^2/2 for sinusoidal. Infinite energy.";
    case 'exp':
      return "Energy signal (a<0): E = A^2/(2|a|). Decays to zero.";
    default:
      return "";
  }
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  words.forEach(word => {
    if ((current + ' ' + word).trim().length > maxChars) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  });
  if (current.trim()) lines.push(current.trim());
  return lines;
}
