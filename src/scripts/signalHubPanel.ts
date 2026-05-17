/**
 * SignalForge 3D — Signal Hub Panel
 * Floating 3D button panel for selecting signal types.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { signalState, SignalState } from "./signalState";

interface ButtonEntry {
  type: string;
  label: string;
  mesh: Mesh;
  borderMesh: Mesh;
  borderMat: StandardMaterial;
}

export function buildSignalHub(scene: Scene, onUpdate: () => void): void {
  const panelX = -3.2;
  const panelY = 2.2;
  const panelZ = 0;

  // Header
  const headerPlane = MeshBuilder.CreatePlane("hubHeader", { width: 0.5, height: 0.1 }, scene);
  headerPlane.position = new Vector3(panelX, panelY + 0.5, panelZ);
  headerPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

  const headerDT = new DynamicTexture("dtHubHeader", { width: 256, height: 48 }, scene, false);
  headerDT.hasAlpha = true;
  const hCtx = headerDT.getContext() as unknown as CanvasRenderingContext2D;
  hCtx.clearRect(0, 0, 256, 48);
  hCtx.font = "bold 28px monospace";
  hCtx.fillStyle = "#00e5c8";
  hCtx.textAlign = "center";
  hCtx.textBaseline = "middle";
  hCtx.fillText("SIGNAL HUB", 128, 24);
  headerDT.update();

  const headerMat = new StandardMaterial("hubHeaderMat", scene);
  headerMat.diffuseTexture = headerDT;
  headerMat.emissiveColor = new Color3(0.3, 0.3, 0.35);
  headerMat.specularColor = Color3.Black();
  headerMat.backFaceCulling = false;
  headerMat.useAlphaFromDiffuseTexture = true;
  headerPlane.material = headerMat;

  // Signal buttons
  const signals = [
    { type: 'step', label: 'STEP u(t)' },
    { type: 'impulse', label: 'IMPULSE d(t)' },
    { type: 'ramp', label: 'RAMP r(t)' },
    { type: 'sine', label: 'SINE ~' },
    { type: 'exp', label: 'EXP e^t' },
  ];

  const buttons: ButtonEntry[] = [];

  signals.forEach((sig, i) => {
    const y = panelY + 0.3 - i * 0.16;

    // Border (outer box)
    const borderMat = new StandardMaterial(`btnBorder_${sig.type}`, scene);
    borderMat.diffuseColor = new Color3(0, 0.3, 0.26);
    borderMat.emissiveColor = new Color3(0, 0.18, 0.16); // 30%
    borderMat.specularColor = Color3.Black();

    const borderMesh = MeshBuilder.CreateBox(`btnBorderMesh_${sig.type}`, {
      width: 0.46, height: 0.14, depth: 0.05,
    }, scene);
    borderMesh.position = new Vector3(panelX, y, panelZ);
    borderMesh.billboardMode = Mesh.BILLBOARDMODE_Y;
    borderMesh.material = borderMat;

    // Button face
    const btnMat = new StandardMaterial(`btnFace_${sig.type}`, scene);
    btnMat.diffuseColor = new Color3(0.051, 0.051, 0.18); // #0d0d2e
    btnMat.specularColor = Color3.Black();

    const mesh = MeshBuilder.CreateBox(`btn_${sig.type}`, {
      width: 0.42, height: 0.12, depth: 0.05,
    }, scene);
    mesh.position = new Vector3(panelX, y, panelZ - 0.001);
    mesh.billboardMode = Mesh.BILLBOARDMODE_Y;
    mesh.material = btnMat;

    // Label texture
    const dt = new DynamicTexture(`dt_btn_${sig.type}`, { width: 256, height: 48 }, scene, false);
    dt.hasAlpha = true;
    const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, 256, 48);
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sig.label, 128, 24);
    dt.update();

    const lblMat = new StandardMaterial(`btnLbl_${sig.type}`, scene);
    lblMat.diffuseTexture = dt;
    lblMat.emissiveColor = new Color3(0.5, 0.5, 0.55);
    lblMat.specularColor = Color3.Black();
    lblMat.backFaceCulling = false;
    lblMat.useAlphaFromDiffuseTexture = true;

    const lblPlane = MeshBuilder.CreatePlane(`btnLblPlane_${sig.type}`, { width: 0.4, height: 0.1 }, scene);
    lblPlane.position = new Vector3(panelX, y, panelZ - 0.03);
    lblPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    lblPlane.material = lblMat;

    // Click action
    mesh.actionManager = new ActionManager(scene);
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        signalState.update({ type: sig.type as SignalState['type'] });
        updateActiveButton(buttons, sig.type);
        onUpdate();
      })
    );

    // Also make border clickable
    borderMesh.actionManager = new ActionManager(scene);
    borderMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        signalState.update({ type: sig.type as SignalState['type'] });
        updateActiveButton(buttons, sig.type);
        onUpdate();
      })
    );

    buttons.push({ type: sig.type, label: sig.label, mesh, borderMesh, borderMat });
  });

  // ── OVERLAY B Button ──
  const overlayY = panelY + 0.3 - 5 * 0.16;
  const overlayBorderMat = new StandardMaterial("overlayBorderMat", scene);
  overlayBorderMat.diffuseColor = new Color3(0.3, 0.1, 0.1);
  overlayBorderMat.emissiveColor = new Color3(0.15, 0.05, 0.05);
  overlayBorderMat.specularColor = Color3.Black();

  const overlayBorder = MeshBuilder.CreateBox("overlayBorder", {
    width: 0.46, height: 0.14, depth: 0.05,
  }, scene);
  overlayBorder.position = new Vector3(panelX, overlayY, panelZ);
  overlayBorder.billboardMode = Mesh.BILLBOARDMODE_Y;
  overlayBorder.material = overlayBorderMat;

  const overlayBtn = MeshBuilder.CreateBox("overlayBtn", {
    width: 0.42, height: 0.12, depth: 0.05,
  }, scene);
  overlayBtn.position = new Vector3(panelX, overlayY, panelZ - 0.001);
  overlayBtn.billboardMode = Mesh.BILLBOARDMODE_Y;
  const overlayBtnMat = new StandardMaterial("overlayBtnMat", scene);
  overlayBtnMat.diffuseColor = new Color3(0.15, 0.05, 0.05);
  overlayBtnMat.specularColor = Color3.Black();
  overlayBtn.material = overlayBtnMat;

  // Overlay label
  const overlayDT = new DynamicTexture("dt_overlayBtn", { width: 256, height: 48 }, scene, false);
  overlayDT.hasAlpha = true;
  const oCtx = overlayDT.getContext() as unknown as CanvasRenderingContext2D;
  oCtx.clearRect(0, 0, 256, 48);
  oCtx.font = "bold 22px 'Courier New', monospace";
  oCtx.fillStyle = "#ff6b6b";
  oCtx.textAlign = "center";
  oCtx.textBaseline = "middle";
  oCtx.fillText("OVERLAY B", 128, 24);
  overlayDT.update();

  const overlayLblMat = new StandardMaterial("overlayLblMat", scene);
  overlayLblMat.diffuseTexture = overlayDT;
  overlayLblMat.emissiveColor = new Color3(0.4, 0.2, 0.2);
  overlayLblMat.specularColor = Color3.Black();
  overlayLblMat.backFaceCulling = false;
  overlayLblMat.useAlphaFromDiffuseTexture = true;

  const overlayLbl = MeshBuilder.CreatePlane("overlayLblPlane", { width: 0.4, height: 0.1 }, scene);
  overlayLbl.position = new Vector3(panelX, overlayY, panelZ - 0.03);
  overlayLbl.billboardMode = Mesh.BILLBOARDMODE_ALL;
  overlayLbl.material = overlayLblMat;

  overlayBtn.actionManager = new ActionManager(scene);
  overlayBtn.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const current = signalState.get();
      signalState.update({ overlayActive: !current.overlayActive });
      overlayBorderMat.emissiveColor = !current.overlayActive
        ? new Color3(0.5, 0.2, 0.2)
        : new Color3(0.15, 0.05, 0.05);
      onUpdate();
    })
  );

  // ── CHALLENGE MODE Button ──
  const challengeY = overlayY - 0.2;
  const challengeBorderMat = new StandardMaterial("challengeBorderMat", scene);
  challengeBorderMat.diffuseColor = new Color3(0.2, 0.1, 0.3);
  challengeBorderMat.emissiveColor = new Color3(0.1, 0.05, 0.15);
  challengeBorderMat.specularColor = Color3.Black();

  const challengeBorder = MeshBuilder.CreateBox("challengeBorder", {
    width: 0.46, height: 0.14, depth: 0.05,
  }, scene);
  challengeBorder.position = new Vector3(panelX, challengeY, panelZ);
  challengeBorder.billboardMode = Mesh.BILLBOARDMODE_Y;
  challengeBorder.material = challengeBorderMat;

  const challengeBtn = MeshBuilder.CreateBox("challengeBtn", {
    width: 0.42, height: 0.12, depth: 0.05,
  }, scene);
  challengeBtn.position = new Vector3(panelX, challengeY, panelZ - 0.001);
  challengeBtn.billboardMode = Mesh.BILLBOARDMODE_Y;
  const challengeBtnMat = new StandardMaterial("challengeBtnMat", scene);
  challengeBtnMat.diffuseColor = new Color3(0.1, 0.05, 0.15);
  challengeBtnMat.specularColor = Color3.Black();
  challengeBtn.material = challengeBtnMat;

  const challengeDT = new DynamicTexture("dt_challengeBtn", { width: 256, height: 48 }, scene, false);
  challengeDT.hasAlpha = true;
  const cCtx = challengeDT.getContext() as unknown as CanvasRenderingContext2D;
  cCtx.clearRect(0, 0, 256, 48);
  cCtx.font = "bold 20px 'Courier New', monospace";
  cCtx.fillStyle = "#a78bfa";
  cCtx.textAlign = "center";
  cCtx.textBaseline = "middle";
  cCtx.fillText("CHALLENGE", 128, 24);
  challengeDT.update();

  const challengeLblMat = new StandardMaterial("challengeLblMat", scene);
  challengeLblMat.diffuseTexture = challengeDT;
  challengeLblMat.emissiveColor = new Color3(0.3, 0.2, 0.4);
  challengeLblMat.specularColor = Color3.Black();
  challengeLblMat.backFaceCulling = false;
  challengeLblMat.useAlphaFromDiffuseTexture = true;

  const challengeLbl = MeshBuilder.CreatePlane("challengeLblPlane", { width: 0.4, height: 0.1 }, scene);
  challengeLbl.position = new Vector3(panelX, challengeY, panelZ - 0.03);
  challengeLbl.billboardMode = Mesh.BILLBOARDMODE_ALL;
  challengeLbl.material = challengeLblMat;

  challengeBtn.actionManager = new ActionManager(scene);
  challengeBtn.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const current = signalState.get();
      const newChallengeMode = !current.challengeMode;
      if (newChallengeMode) {
        signalState.update({ challengeMode: true, type: 'exp' });
        updateActiveButton(buttons, 'exp');
      } else {
        signalState.update({ challengeMode: false });
      }
      challengeBorderMat.emissiveColor = newChallengeMode
        ? new Color3(0.33, 0.22, 0.49)
        : new Color3(0.1, 0.05, 0.15);
      onUpdate();
    })
  );

  // Set initial active state
  updateActiveButton(buttons, signalState.get().type);
}

function updateActiveButton(buttons: ButtonEntry[], activeType: string): void {
  buttons.forEach(b => {
    if (b.type === activeType) {
      b.borderMat.emissiveColor = new Color3(0, 0.898, 0.784); // 100% #00e5c8
    } else {
      b.borderMat.emissiveColor = new Color3(0, 0.18, 0.16);   // 30%
    }
  });
}
