import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { Vector3, Quaternion } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { signalState, SignalState } from "./signalState";
import { EquipmentRefs } from "./equipmentBuilder";
import { transitionCameraTo, CameraViewPreset } from "./labEnvironment";

interface KnobConfig {
  mesh: Mesh;
  paramKey: string;
  min: number;
  max: number;
  sensitivity: number; // how much per pixel of mouse movement
  isSignal2?: boolean;
}

export function updateKnobVisuals(equipment: EquipmentRefs, state: SignalState): void {
  const knobs = [
    { mesh: equipment.ampKnob, val: state.params.A, min: 0.2, max: 3.0 },
    { mesh: equipment.freqKnob, val: state.params.f, min: 0.1, max: 5.0 },
    { mesh: equipment.phaseKnob, val: state.params.phi, min: 0, max: 6.28 },
    { mesh: equipment.decayKnob, val: state.params.alpha, min: -3.0, max: 0.5 },
    { mesh: equipment.tsKnob, val: state.Ts, min: 0.05, max: 0.5 },
    
    // FG2 Knobs
    { mesh: equipment.amp2Knob, val: state.signal2Params.A, min: 0.2, max: 3.0 },
    { mesh: equipment.freq2Knob, val: state.signal2Params.f, min: 0.1, max: 5.0 },
    { mesh: equipment.phase2Knob, val: state.signal2Params.phi, min: 0, max: 6.28 },
  ];

  // Pre-build the base quaternion once (rotate cylinder height axis from Y → Z so the
  // flat circular face points toward the camera at –Z). This is a pure Rx(π/2).
  const baseQ = Quaternion.RotationAxis(new Vector3(1, 0, 0), Math.PI / 2);

  knobs.forEach(k => {
    if (k.mesh) {
      const percent = Math.max(0, Math.min(1, (k.val - k.min) / (k.max - k.min)));
      // –135 ° (7 o'clock = min) → 0 ° (12 o'clock = mid) → +135 ° (5 o'clock = max)
      const minAngle = -Math.PI * 0.75;
      const maxAngle =  Math.PI * 0.75;
      const dialAngle = minAngle + percent * (maxAngle - minAngle);

      // Rotate around world –Z so positive dialAngle = CLOCKWISE from the camera's view.
      // (Right-hand rule: thumb at +Z → CCW; so thumb at –Z → CW.)
      const dialQ = Quaternion.RotationAxis(new Vector3(0, 0, -1), dialAngle);

      // Compose: apply base face-forward first, then spin in world space.
      // Q = dialQ × baseQ  → baseQ is applied first, dialQ second (world-space).
      k.mesh.rotationQuaternion = dialQ.multiply(baseQ);
    }
  });
}

function getPresetForMesh(mesh: Mesh, equipment: EquipmentRefs): CameraViewPreset | null {
  const name = mesh.name;
  
  // FG2
  if (
    mesh === equipment.amp2Knob ||
    mesh === equipment.freq2Knob ||
    mesh === equipment.phase2Knob ||
    mesh === equipment.funcGen2Body ||
    name.includes("funcGen2") ||
    name.includes("amp2Knob") ||
    name.includes("freq2Knob") ||
    name.includes("phase2Knob")
  ) {
    return 'FG2';
  }

  // FG1
  if (
    mesh === equipment.ampKnob ||
    mesh === equipment.freqKnob ||
    mesh === equipment.phaseKnob ||
    mesh === equipment.decayKnob ||
    mesh === equipment.tsKnob ||
    mesh === equipment.discreteToggle ||
    mesh === equipment.funcGenBody ||
    name.includes("funcGen") ||
    name.includes("ampKnob") ||
    name.includes("freqKnob") ||
    name.includes("phaseKnob") ||
    name.includes("decayKnob") ||
    name.includes("tsKnob") ||
    name.includes("discreteToggle")
  ) {
    return 'FG1';
  }

  // OSC
  if (
    mesh === equipment.oscBody ||
    mesh === equipment.oscilloscopeScreen ||
    name.includes("oscBody") ||
    name.includes("oscilloscopeScreen") ||
    name.includes("crtScreen")
  ) {
    return 'OSC';
  }

  return null;
}

export function setupKnobInteraction(scene: Scene, equipment: EquipmentRefs, onUpdate: () => void): void {
  const knobs: KnobConfig[] = [
    { mesh: equipment.ampKnob, paramKey: 'A', min: 0.2, max: 3.0, sensitivity: 0.01 },
    { mesh: equipment.freqKnob, paramKey: 'f', min: 0.1, max: 5.0, sensitivity: 0.015 },
    { mesh: equipment.phaseKnob, paramKey: 'phi', min: 0, max: 6.28, sensitivity: 0.02 },
    { mesh: equipment.decayKnob, paramKey: 'alpha', min: -3.0, max: 0.5, sensitivity: 0.012 },
    { mesh: equipment.tsKnob, paramKey: 'Ts', min: 0.05, max: 0.5, sensitivity: 0.002 },
    
    // FG2 Knobs
    { mesh: equipment.amp2Knob, paramKey: 'A', min: 0.2, max: 3.0, sensitivity: 0.01, isSignal2: true },
    { mesh: equipment.freq2Knob, paramKey: 'f', min: 0.1, max: 5.0, sensitivity: 0.015, isSignal2: true },
    { mesh: equipment.phase2Knob, paramKey: 'phi', min: 0, max: 6.28, sensitivity: 0.02, isSignal2: true },
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
      const picked = pickResult.pickedMesh as Mesh;

      // Camera Zoom / Focus trigger on click
      const targetPreset = getPresetForMesh(picked, equipment);
      if (targetPreset) {
        const state = signalState.get();
        if (state.cameraView !== targetPreset) {
          const activeCamera = scene.activeCamera as ArcRotateCamera;
          if (activeCamera) {
            transitionCameraTo(activeCamera, targetPreset, () => {
              signalState.update({ cameraView: targetPreset });
            });
          }
        }
      }

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
    } else if (activeKnob.isSignal2) {
      const currentVal = (state.signal2Params as unknown as Record<string, number>)[activeKnob.paramKey] ?? 0;
      newValue = clamp(currentVal + deltaY * activeKnob.sensitivity, activeKnob.min, activeKnob.max);
      signalState.update({
        signal2Params: { ...state.signal2Params, [activeKnob.paramKey]: newValue },
      });
    } else {
      const currentVal = (state.params as unknown as Record<string, number>)[activeKnob.paramKey] ?? 0;
      newValue = clamp(currentVal + deltaY * activeKnob.sensitivity, activeKnob.min, activeKnob.max);
      signalState.update({
        params: { ...state.params, [activeKnob.paramKey]: newValue },
      });
    }

    // Sync visual rotations instantly during drag
    updateKnobVisuals(equipment, signalState.get());

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

  // Listen for manual camera deviations to clear zoom state back to 'WIDE'
  const activeCamera = scene.activeCamera as ArcRotateCamera;
  if (activeCamera) {
    activeCamera.onViewMatrixChangedObservable.add(() => {
      const state = signalState.get();
      if (state.cameraView !== 'WIDE' && !(activeCamera.animations && activeCamera.animations.some(a => a.runtimeAnimations && a.runtimeAnimations.length > 0))) {
        let presetTarget: Vector3;
        switch (state.cameraView) {
          case 'FG1':
            presetTarget = new Vector3(-1.2, 1.1, -0.15);
            break;
          case 'FG2':
            presetTarget = new Vector3(-1.2, 1.65, -0.15);
            break;
          case 'OSC':
            presetTarget = new Vector3(1.2, 1.15, -0.15);
            break;
          default:
            return;
        }

        const dist = Vector3.Distance(activeCamera.target, presetTarget);
        const alphaDiff = Math.abs(activeCamera.alpha - (-Math.PI / 2));
        const betaDiff = Math.abs(activeCamera.beta - (Math.PI / 2.1));

        // If manually orbited beyond threshold, reset state
        if (dist > 0.05 || alphaDiff > 0.05 || betaDiff > 0.05) {
          signalState.update({ cameraView: 'WIDE' });
        }
      }
    });
  }

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
