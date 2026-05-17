"use client";

import { useEffect, useRef } from "react";

import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

// Required Babylon.js side-effect imports
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Cameras/universalCamera";
import "@babylonjs/core/Meshes/groundMesh";
import "@babylonjs/core/Lights/directionalLight";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/Rendering/prePassRendererSceneComponent";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

// SignalForge modules
import { buildLabEnvironment } from "@/scripts/labEnvironment";
import { buildEquipment } from "@/scripts/equipmentBuilder";
import { HolographicWaveRenderer } from "@/scripts/holographicWave";
import { buildSignalHub } from "@/scripts/signalHubPanel";
import { setupKnobInteraction } from "@/scripts/knobInteraction";
import { OscilloscopeDisplay } from "@/scripts/oscilloscopeScreen";
import { InfoPanelDisplay } from "@/scripts/infoPanelDisplay";
import { ChallengeMode } from "@/scripts/challengeMode";
import { runOnboardingTour } from "@/scripts/onboardingTour";
import { signalState } from "@/scripts/signalState";

import { CreatorEngineLoadingScreen } from "@/creatorengine-loading-screen";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const engine = new Engine(canvasRef.current, true, {
      stencil: true,
      antialias: true,
      audioEngine: false,
      adaptToDeviceRatio: true,
      disableWebGL2Support: false,
      useHighPrecisionFloats: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
    engine.loadingScreen = new CreatorEngineLoadingScreen();

    const scene = new Scene(engine);

    initSignalForgeLab(engine, scene);

    const resizeListener = () => engine.resize();
    window.addEventListener("resize", resizeListener);

    return () => {
      scene.dispose();
      engine.dispose();
      window.removeEventListener("resize", resizeListener);
    };
  }, [canvasRef]);

  async function initSignalForgeLab(engine: Engine, scene: Scene) {
    // ═══════════════════════════════════════════════
    // LAYER 1 — ENVIRONMENT
    // ═══════════════════════════════════════════════
    const labRefs = buildLabEnvironment(scene);

    // ═══════════════════════════════════════════════
    // LAYER 2 — EQUIPMENT
    // ═══════════════════════════════════════════════
    const equipment = buildEquipment(scene);

    // ═══════════════════════════════════════════════
    // LAYER 3 — SIGNAL WAVE RENDERER
    // ═══════════════════════════════════════════════
    const waveRenderer = new HolographicWaveRenderer(scene);

    // ═══════════════════════════════════════════════
    // LAYER 4 — DISPLAYS
    // ═══════════════════════════════════════════════
    const oscDisplay = new OscilloscopeDisplay(scene, equipment.oscilloscopeScreen);
    const infoPanel = new InfoPanelDisplay(scene);
    const challenge = new ChallengeMode(scene, equipment, labRefs);

    // ═══════════════════════════════════════════════
    // MASTER UPDATE — called on every state change
    // ═══════════════════════════════════════════════
    function updateAll(): void {
      const state = signalState.get();

      // Re-render holographic wave
      waveRenderer.render(state);

      // Shadow wave for challenge mode
      waveRenderer.renderShadow(state.challengeMode);

      // Overlay
      waveRenderer.renderOverlay(state);

      // Update displays
      const overlayType = state.overlayActive
        ? (state.type === 'sine' ? 'step' : 'sine')
        : undefined;
      oscDisplay.update(state, overlayType);
      infoPanel.update(state);
      challenge.update(state);
    }

    // ═══════════════════════════════════════════════
    // LAYER 5 — INTERACTION
    // ═══════════════════════════════════════════════
    buildSignalHub(scene, updateAll);
    setupKnobInteraction(scene, equipment, updateAll);

    // ═══════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type !== KeyboardEventTypes.KEYDOWN) return;
      const camera = scene.activeCamera as ArcRotateCamera;
      if (!camera) return;

      switch (kbInfo.event.key.toLowerCase()) {
        case 'f':
          // Focus on oscilloscope screen
          camera.setTarget(new Vector3(1.2, 1.22, 0));
          camera.radius = 2.5;
          break;
        case 'g':
          // Focus on holographic wave
          camera.setTarget(new Vector3(0, 2.0, 0));
          camera.radius = 4;
          break;
        case 'r':
          // Reset camera
          camera.setTarget(new Vector3(0, 0.85, 0));
          camera.radius = 6;
          camera.alpha = -Math.PI / 2;
          camera.beta = Math.PI / 3;
          break;
      }
    });

    // ═══════════════════════════════════════════════
    // PERFORMANCE MONITOR — adaptive quality
    // ═══════════════════════════════════════════════
    let frameCount = 0;
    scene.onBeforeRenderObservable.add(() => {
      frameCount++;
      if (frameCount % 60 === 0) {
        const fps = engine.getFps();
        if (fps < 45) {
          waveRenderer.setAdaptive(true);
        } else if (fps > 55) {
          waveRenderer.setAdaptive(false);
        }
      }
    });

    // ═══════════════════════════════════════════════
    // INITIAL RENDER + TOUR
    // ═══════════════════════════════════════════════
    updateAll();

    // Start onboarding tour after a brief delay
    setTimeout(() => {
      runOnboardingTour(scene);
    }, 1500);

    // ═══════════════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════════════
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Hide loading screen
    engine.hideLoadingUI();
  }

  return (
    <main className="flex w-screen h-screen flex-col items-center justify-between">
      <canvas ref={canvasRef} className="w-full h-full outline-none select-none" />
    </main>
  );
}
