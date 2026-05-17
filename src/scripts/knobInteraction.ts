/**
 * SignalForge 3D — Interactive Knob Controller
 * Handles pointer-based knob rotation on the Function Generator.
 * Drag up/down on a knob to change its parameter.
 */

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { signalState } from "./signalState";
import { EquipmentRefs } from "./equipmentBuilder";

interface KnobConfig {
  mesh: Mesh;
  paramKey: string;
  min: number;
  max: number;
  sensitivity: number; // how much per pixel of mouse movement
}

export function setupKnobInteraction(scene: Scene, equipment: EquipmentRefs, onUpdate: () => void): void {
  const knobs: KnobConfig[] = [
    { mesh: equipment.ampKnob, paramKey: 'A', min: 0.2, max: 3.0, sensitivity: 0.01 },
    { mesh: equipment.freqKnob, paramKey: 'f', min: 0.1, max: 5.0, sensitivity: 0.015 },
    { mesh: equipment.phaseKnob, paramKey: 'phi', min: 0, max: 6.28, sensitivity: 0.02 },
    { mesh: equipment.decayKnob, paramKey: 'alpha', min: -3.0, max: 0.5, sensitivity: 0.012 },
    { mesh: equipment.tsKnob, paramKey: 'Ts', min: 0.05, max: 0.5, sensitivity: 0.002 },
  ];

  let activeKnob: KnobConfig | null = null;
  let lastPointerY = 0;

  knobs.forEach(knobConfig => {
    const knob = knobConfig.mesh;

    // Ensure action manager
    if (!knob.actionManager) {
      knob.actionManager = new ActionManager(scene);
    }

    // Hover glow
    knob.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        const mat = knob.material as StandardMaterial;
        if (mat) {
          mat.emissiveColor = mat.diffuseColor.scale(0.6);
        }
        scene.hoverCursor = "grab";
      })
    );

    knob.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        const mat = knob.material as StandardMaterial;
        if (mat) {
          mat.emissiveColor = mat.diffuseColor.scale(0.3);
        }
        scene.hoverCursor = "default";
      })
    );
  });

  // Pointer down on canvas
  scene.onPointerDown = (evt) => {
    const pickResult = scene.pick(evt.offsetX, evt.offsetY);
    if (pickResult && pickResult.hit && pickResult.pickedMesh) {
      const picked = pickResult.pickedMesh;
      const knobConfig = knobs.find(k => k.mesh === picked || k.mesh.name === picked.name);
      if (knobConfig) {
        activeKnob = knobConfig;
        lastPointerY = evt.offsetY;
        // Detach camera to prevent orbit while dragging
        if (scene.activeCamera) {
          scene.activeCamera.detachControl();
        }
      }
    }
  };

  // Pointer move for dragging
  scene.onPointerMove = (evt) => {
    if (!activeKnob) return;

    const deltaY = lastPointerY - evt.offsetY; // up = positive
    lastPointerY = evt.offsetY;

    const state = signalState.get();
    let newValue: number;

    if (activeKnob.paramKey === 'Ts') {
      newValue = clamp(state.Ts + deltaY * activeKnob.sensitivity, activeKnob.min, activeKnob.max);
      signalState.update({ Ts: newValue });
    } else {
      const currentVal = (state.params as unknown as Record<string, number>)[activeKnob.paramKey] ?? 0;
      newValue = clamp(currentVal + deltaY * activeKnob.sensitivity, activeKnob.min, activeKnob.max);
      signalState.update({
        params: { ...state.params, [activeKnob.paramKey]: newValue },
      });
    }

    // Rotate knob mesh visually
    activeKnob.mesh.rotation.y += deltaY * 0.03;

    onUpdate();
  };

  // Pointer up
  scene.onPointerUp = () => {
    if (activeKnob) {
      activeKnob = null;
      // Re-attach camera controls
      const canvas = scene.getEngine().getRenderingCanvas();
      if (scene.activeCamera && canvas) {
        scene.activeCamera.attachControl(canvas, true);
      }
    }
  };

  // ── Discrete Toggle ──
  const toggle = equipment.discreteToggle;
  if (!toggle.actionManager) {
    toggle.actionManager = new ActionManager(scene);
  }

  toggle.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const state = signalState.get();
      const newDiscrete = !state.discrete;
      signalState.update({ discrete: newDiscrete });

      // Animate toggle
      const tMat = toggle.material as StandardMaterial;
      if (tMat) {
        if (newDiscrete) {
          tMat.diffuseColor = new Color3(0, 0.9, 0.463); // #00e676
          tMat.emissiveColor = new Color3(0, 0.4, 0.2);
          toggle.position.y += 0.02;
        } else {
          tMat.diffuseColor = new Color3(1, 0.42, 0.42); // #ff6b6b
          tMat.emissiveColor = new Color3(0.3, 0.1, 0.1);
          toggle.position.y -= 0.02;
        }
      }

      onUpdate();
    })
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
