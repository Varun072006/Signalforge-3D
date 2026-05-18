/**
 * SignalForge 3D — Onboarding Tour (Interactive)
 * Guides the user through a realistic engineering lab sequence:
 * Power ON -> Connect Cable -> Adjust Knobs -> Observe -> Sample.
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
import { EquipmentRefs } from "./equipmentBuilder";
import { signalState } from "./signalState";

export function runOnboardingTour(scene: Scene, equipment: EquipmentRefs): void {
  let tooltipPlane: Mesh | null = null;
  let arrowMesh: Mesh | null = null;
  let currentStep = 0;
  let unsubscribe: (() => void) | null = null;
  let actionObserver: any = null;

  // Make the oscilloscope screen act like a button during onboarding
  if (!equipment.oscilloscopeScreen.actionManager) {
    equipment.oscilloscopeScreen.actionManager = new ActionManager(scene);
  }

  function cleanupTooltip() {
    if (tooltipPlane) { tooltipPlane.dispose(); tooltipPlane = null; }
    if (arrowMesh) { arrowMesh.dispose(); arrowMesh = null; }
  }

  function createTooltip(position: Vector3, text: string) {
    cleanupTooltip();
    tooltipPlane = MeshBuilder.CreatePlane("tourTooltip", { width: 1.4, height: 0.6 }, scene);
    tooltipPlane.position = position.clone();
    tooltipPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

    const dt = new DynamicTexture("tourDT", { width: 700, height: 300 }, scene, false);
    dt.hasAlpha = true;
    const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;

    ctx.fillStyle = "rgba(3, 3, 20, 0.9)";
    ctx.fillRect(0, 0, 700, 300);

    ctx.strokeStyle = "#00e5c8";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 692, 292);

    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#00e5c8";
    ctx.textAlign = "left";
    ctx.fillText(`LAB INSTRUCTION ${currentStep}`, 16, 28);

    ctx.font = "24px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 350, 100 + i * 36);
    });
    dt.update();

    const mat = new StandardMaterial("tourMat", scene);
    mat.diffuseTexture = dt;
    mat.emissiveColor = new Color3(0.5, 0.5, 0.55);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    tooltipPlane.material = mat;

    // Scale-up animation
    tooltipPlane.scaling = Vector3.Zero();
    const scaleAnim = new Animation("tooltipScale", "scaling", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    scaleAnim.setKeys([
      { frame: 0, value: new Vector3(0, 0, 0) },
      { frame: 10, value: new Vector3(1.05, 1.05, 1.05) },
      { frame: 15, value: new Vector3(1, 1, 1) },
    ]);
    tooltipPlane.animations = [scaleAnim];
    scene.beginAnimation(tooltipPlane, 0, 15, false);

    arrowMesh = MeshBuilder.CreateCylinder("tourArrow", { diameterTop: 0, diameterBottom: 0.08, height: 0.2 }, scene);
    arrowMesh.position = new Vector3(position.x, position.y - 0.45, position.z);
    arrowMesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    const arrowMat = new StandardMaterial("arrowMat", scene);
    arrowMat.diffuseColor = new Color3(0, 0.898, 0.784);
    arrowMat.emissiveColor = new Color3(0, 0.45, 0.4);
    arrowMat.specularColor = Color3.Black();
    arrowMesh.material = arrowMat;
  }

  function showNextStep() {
    currentStep++;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (actionObserver) {
      scene.onPointerObservable.remove(actionObserver);
      actionObserver = null;
    }

    if (currentStep === 1) {
      // Step 1: Turn ON oscilloscope
      createTooltip(new Vector3(1.2, 2.0, -0.5), "Welcome to the SignalForge Lab.\n\nClick the Oscilloscope screen\nto power it ON.");
      equipment.oscilloscopeScreen.actionManager!.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
          if (currentStep === 1) {
            signalState.update({ oscPower: true });
            
            // Re-render manually or wait for the update trigger to re-render
            const mat = equipment.oscilloscopeScreen.material as StandardMaterial;
            if (mat) {
              mat.emissiveColor = new Color3(0, 0.8, 0.2); // Flash bright green
              setTimeout(() => { mat.emissiveColor = new Color3(0, 0.25, 0.05); }, 300);
            }
            
            setTimeout(showNextStep, 500);
          }
        })
      );
    } 
    else if (currentStep === 2) {
      // Step 2: Connect signal generator
      createTooltip(new Vector3(-0.4, 1.8, -0.2), "The oscilloscope is on.\nNow, click the Signal Generator (left box)\nto connect the BNC cable.");
      actionObserver = scene.onPointerObservable.add((pi) => {
        if (pi.type === 1) { // POINTERDOWN
          if (pi.pickInfo?.pickedMesh) {
            const name = pi.pickInfo.pickedMesh.name;
            if (name.includes("funcGen") || name.includes("bncOut") || name.includes("bncIn") || name.includes("oscBody")) {
              signalState.update({ cableConnected: true });
              setTimeout(showNextStep, 800);
            }
          }
        }
      });
    }
    else if (currentStep === 3) {
      // Step 3: Rotate frequency knob
      createTooltip(new Vector3(-1.2, 1.8, -0.5), "Signal connected!\nDrag the FREQ knob up or down\nto adjust the frequency.");
      const initialState = signalState.get();
      unsubscribe = signalState.subscribe((state) => {
        if (Math.abs(state.params.f - initialState.params.f) > 0.05) {
          setTimeout(showNextStep, 600);
        }
      });
    }
    else if (currentStep === 4) {
      // Step 4: Watches waveform update
      createTooltip(new Vector3(0, 2.6, -0.3), "Observe the holographic wave.\nThe signal trace updates in real-time\nas you turn the physical knobs.");
      setTimeout(showNextStep, 4500);
    }
    else if (currentStep === 5) {
      // Step 5: Enable discrete sampling
      createTooltip(new Vector3(-1.45, 1.4, -0.5), "Now let's sample this signal.\nClick the red D/C toggle switch\nto enable Discrete sampling.");
      unsubscribe = signalState.subscribe((state) => {
        if (state.discrete) {
          setTimeout(showNextStep, 1000);
        }
      });
    }
    else if (currentStep === 6) {
      // Step 6: Measures signal values
      createTooltip(new Vector3(8.0, 2.5, 0), "The Info Panel on the right wall\ndisplays live signal measurements\nand mathematical analytics.");
      setTimeout(showNextStep, 4500);
    }
    else if (currentStep === 7) {
      // Step 7: Completes experiment
      createTooltip(new Vector3(0, 2.5, -0.5), "Experiment Complete!\n\nRecord your observations and\nexplore the rest of the lab.");
      setTimeout(() => {
        cleanupTooltip();
      }, 5000);
    }
  }

  showNextStep(); // Starts at step 1
}
