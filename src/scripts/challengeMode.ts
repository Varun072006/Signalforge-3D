/**
 * SignalForge 3D — Challenge Mode Controller
 * Manages the shadow wave matching game and success effects.
 */

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Animation } from "@babylonjs/core/Animations/animation";
import { SignalState } from "./signalState";
import { EquipmentRefs } from "./equipmentBuilder";
import { LabEnvironmentRefs } from "./labEnvironment";

const TARGET_ALPHA = -1.5;
const TEX_W = 400;
const TEX_H = 280;

export class ChallengeMode {
  private scene: Scene;
  private challengeBoard: Mesh;
  private wallDisplay: Mesh;
  private floor: Mesh;
  private bncCable: Mesh;
  private texture: DynamicTexture;
  private wallTexture: DynamicTexture;
  private wallMat: StandardMaterial;
  private successTriggered = false;

  constructor(scene: Scene, equipment: EquipmentRefs, labRefs: LabEnvironmentRefs) {
    this.scene = scene;
    this.challengeBoard = equipment.challengeBoard;
    this.wallDisplay = equipment.wallDisplay;
    this.floor = labRefs.floor;
    this.bncCable = equipment.bncCable;

    // Challenge board texture
    this.texture = new DynamicTexture("challengeDT", { width: TEX_W, height: TEX_H }, scene, false);
    this.texture.hasAlpha = false;

    const mat = new StandardMaterial("challengeBoardMat", scene);
    mat.diffuseTexture = this.texture;
    mat.emissiveColor = new Color3(0.25, 0.2, 0.35);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    this.challengeBoard.material = mat;

    // Wall display texture
    this.wallTexture = new DynamicTexture("wallDisplayDT", { width: 512, height: 300 }, scene, false);
    this.wallTexture.hasAlpha = false;

    this.wallMat = new StandardMaterial("wallDisplayMat", scene);
    this.wallMat.diffuseTexture = this.wallTexture;
    this.wallMat.emissiveColor = new Color3(0.2, 0.2, 0.25);
    this.wallMat.specularColor = Color3.Black();
    this.wallMat.backFaceCulling = false;
    this.wallDisplay.material = this.wallMat;

    this.updateWallDisplay("SIGNALFORGE 3D", "Virtual Electronics Lab", "#00e5c8");
  }

  /** Update challenge state based on current signal parameters */
  update(state: SignalState): void {
    if (!state.challengeMode) {
      this.drawInactiveBoard();
      if (this.successTriggered) {
        this.resetSuccess();
      }
      return;
    }

    const matchPercent = Math.max(0, 100 - Math.abs(state.params.alpha - TARGET_ALPHA) * 40);
    this.drawActiveBoard(state.params.alpha, matchPercent);

    if (matchPercent >= 90 && !this.successTriggered) {
      this.triggerSuccess(state.params.alpha);
    } else if (matchPercent < 90 && this.successTriggered) {
      this.resetSuccess();
    }
  }

  private drawInactiveBoard(): void {
    const ctx = this.texture.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#a78bfa";
    ctx.textAlign = "center";
    ctx.fillText("CHALLENGE MODE", TEX_W / 2, 40);

    ctx.font = "16px monospace";
    ctx.fillStyle = "#606080";
    ctx.fillText("Click CHALLENGE to start", TEX_W / 2, TEX_H / 2);

    this.texture.update();
  }

  private drawActiveBoard(currentAlpha: number, matchPercent: number): void {
    const ctx = this.texture.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    // Border
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, TEX_W - 8, TEX_H - 8);

    // Title
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#a78bfa";
    ctx.textAlign = "center";
    ctx.fillText("MATCH THE SHADOW", TEX_W / 2, 35);

    // Target
    ctx.font = "16px monospace";
    ctx.fillStyle = "#c0c0d0";
    ctx.fillText(`Target: a = ${TARGET_ALPHA.toFixed(2)}`, TEX_W / 2, 65);

    // Current
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Current: a = ${currentAlpha.toFixed(2)}`, TEX_W / 2, 90);

    // Instructions
    ctx.font = "13px monospace";
    ctx.fillStyle = "#707090";
    ctx.fillText("Adjust the DECAY knob", TEX_W / 2, 115);

    // Progress bar background
    const barX = 30;
    const barY = 140;
    const barW = TEX_W - 60;
    const barH = 30;
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(barX, barY, barW, barH);

    // Progress bar fill
    const fillW = (matchPercent / 100) * barW;
    const barColor = matchPercent >= 90 ? "#00e676" : matchPercent >= 50 ? "#ffcc00" : "#ff6b6b";
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, fillW, barH);

    // Progress bar border
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Percentage text
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`${matchPercent.toFixed(0)}%`, TEX_W / 2, barY + 22);

    // Status
    ctx.font = "bold 16px monospace";
    if (matchPercent >= 90) {
      ctx.fillStyle = "#00e676";
      ctx.fillText("TARGET ACQUIRED", TEX_W / 2, barY + 60);
    } else {
      ctx.fillStyle = "#707090";
      ctx.fillText("ADJUSTING...", TEX_W / 2, barY + 60);
    }

    this.texture.update();
  }

  private triggerSuccess(alpha: number): void {
    this.successTriggered = true;
    console.log("Challenge complete! Alpha matched:", alpha);

    // Wall display: SIGNAL MATCHED
    this.updateWallDisplay("SIGNAL MATCHED", `a = ${alpha.toFixed(2)}`, "#00e676");

    // Floor pulse green animation
    this.pulseFloorGreen();

    // Cable flash white
    this.flashCable();
  }

  private resetSuccess(): void {
    this.successTriggered = false;
    this.updateWallDisplay("SIGNALFORGE 3D", "Virtual Electronics Lab", "#00e5c8");
  }

  private updateWallDisplay(line1: string, line2: string, color: string): void {
    const ctx = this.wallTexture.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, 512, 300);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 492, 280);

    ctx.font = "bold 32px monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(line1, 256, 130);

    ctx.font = "20px monospace";
    ctx.fillStyle = "#c0c0d0";
    ctx.fillText(line2, 256, 175);

    this.wallTexture.update();
  }

  private pulseFloorGreen(): void {
    const floorMat = this.floor.material;
    if (!floorMat) return;

    // Create a brief color pulse using Babylon animation
    const anim = new Animation(
      "floorPulse",
      "material.lineColor",
      30,
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [
      { frame: 0, value: new Color3(0, 0.898, 0.784) },
      { frame: 10, value: new Color3(0, 0.9, 0.463) },  // green
      { frame: 20, value: new Color3(0, 0.898, 0.784) },
      { frame: 30, value: new Color3(0, 0.9, 0.463) },
      { frame: 40, value: new Color3(0, 0.898, 0.784) },
      { frame: 45, value: new Color3(0, 0.898, 0.784) },
    ];
    anim.setKeys(keys);

    this.floor.animations = [anim];
    this.scene.beginAnimation(this.floor, 0, 45, false);
  }

  private flashCable(): void {
    const cableMat = this.bncCable.material as StandardMaterial;
    if (!cableMat) return;

    const origEmissive = cableMat.emissiveColor.clone();

    // Brief white flash
    cableMat.emissiveColor = new Color3(1, 1, 1);
    setTimeout(() => {
      cableMat.emissiveColor = origEmissive;
    }, 300);
  }
}
