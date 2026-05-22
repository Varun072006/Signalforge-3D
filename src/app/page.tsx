"use client";

import { useEffect, useRef, useState } from "react";

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
import { buildLabEnvironment, transitionCameraTo } from "@/scripts/labEnvironment";
import { buildEquipment } from "@/scripts/equipmentBuilder";
import { HolographicWaveRenderer } from "@/scripts/holographicWave";
import { buildSignalHub } from "@/scripts/signalHubPanel";
import { setupKnobInteraction, updateKnobVisuals } from "@/scripts/knobInteraction";
import { OscilloscopeDisplay } from "@/scripts/oscilloscopeScreen";
import { InfoPanelDisplay } from "@/scripts/infoPanelDisplay";
import { ChallengeMode } from "@/scripts/challengeMode";
import { runOnboardingTour } from "@/scripts/onboardingTour";
import { signalState } from "@/scripts/signalState";
import { FuncGenDisplay } from "@/scripts/funcGenScreen";

import { CreatorEngineLoadingScreen } from "@/creatorengine-loading-screen";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [appState, setAppState] = useState(signalState.get());

  useEffect(() => {
    const unsub = signalState.subscribe((state) => {
      setAppState(state);
    });
    return unsub;
  }, []);

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
    sceneRef.current = scene;

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
    const fg1Display = new FuncGenDisplay(scene, equipment.funcGenScreen, false);
    const fg2Display = new FuncGenDisplay(scene, equipment.funcGen2Screen, true);

    // ═══════════════════════════════════════════════
    // MASTER UPDATE — called on every state change
    // ═══════════════════════════════════════════════
    function updateAll(): void {
      const state = signalState.get();
      equipment.bncCable.isVisible = state.cableConnected;

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
      updateKnobVisuals(equipment, state);
      fg1Display.update(state, false);
      fg2Display.update(state, true);
    }

    // ═══════════════════════════════════════════════
    // LAYER 5 — INTERACTION
    // ═══════════════════════════════════════════════
    // buildSignalHub(scene, updateAll);
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
          transitionCameraTo(camera, 'OSC', () => {
            signalState.update({ cameraView: 'OSC' });
          });
          break;
        case 'g':
        case 'r':
          transitionCameraTo(camera, 'WIDE', () => {
            signalState.update({ cameraView: 'WIDE' });
          });
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
      runOnboardingTour(scene, equipment);
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

  // Handle UI changes
  const handleTaskChange = (task: string) => {
    signalState.update({ activeTask: task });
  };
  
  const handleExitZoom = () => {
    if (sceneRef.current && sceneRef.current.activeCamera) {
      transitionCameraTo(sceneRef.current.activeCamera as ArcRotateCamera, 'WIDE', () => {
        signalState.update({ cameraView: 'WIDE' });
      });
    }
  };
  
  const handleTypeChange = (type: string) => {
    signalState.update({ type });
  };
  
  const handleParamChange = (param: string, value: number) => {
    signalState.update({ params: { ...appState.params, [param]: value } });
  };

  const tasks = [
    "Signal Plot",
    "Signal Product",
    "Real Sinusoids",
    "Complex Sinusoids",
    "Haar Wavelet",
    "Orthogonality Test"
  ];

  // Dynamic control renderer
  const renderControls = () => {
    switch (appState.activeTask) {
      case "Signal Plot":
      case "Real Sinusoids":
      case "Haar Wavelet":
        return (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Signal Type</label>
              <select 
                value={appState.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="sine">Sine</option>
                <option value="step">Unit Step</option>
                <option value="impulse">Unit Impulse</option>
                <option value="ramp">Unit Ramp</option>
                <option value="exp">Exponential</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Frequency (Hz)</label>
              <input 
                type="number" step="0.1" value={appState.params.f}
                onChange={(e) => handleParamChange('f', parseFloat(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Amplitude</label>
              <input 
                type="number" step="0.1" value={appState.params.A}
                onChange={(e) => handleParamChange('A', parseFloat(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Phase (rad)</label>
              <input 
                type="number" step="0.1" value={appState.params.phi}
                onChange={(e) => handleParamChange('phi', parseFloat(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
          </>
        );
      case "Signal Product":
      case "Orthogonality Test":
      case "Complex Sinusoids":
        return (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Signal 1 Type</label>
              <select 
                value={appState.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="sine">Sine</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Freq 1</label>
                <input 
                  type="number" step="0.1" value={appState.params.f}
                  onChange={(e) => handleParamChange('f', parseFloat(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Amp 1</label>
                <input 
                  type="number" step="0.1" value={appState.params.A}
                  onChange={(e) => handleParamChange('A', parseFloat(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-200">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Signal 2 Type</label>
              <select 
                value={appState.signal2Type}
                onChange={(e) => signalState.update({ signal2Type: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="sine">Sine</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Freq 2</label>
                <input 
                  type="number" step="0.1" value={appState.signal2Params.f}
                  onChange={(e) => signalState.update({ signal2Params: { ...appState.signal2Params, f: parseFloat(e.target.value) } })}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Amp 2</label>
                <input 
                  type="number" step="0.1" value={appState.signal2Params.A}
                  onChange={(e) => signalState.update({ signal2Params: { ...appState.signal2Params, A: parseFloat(e.target.value) } })}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white font-sans text-gray-800">
      {/* 3D Canvas - handles its own pointer events */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full outline-none select-none z-0" style={{ pointerEvents: 'auto' }} />
      
      {/* UI Overlay Container - passes clicks through where empty */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        {/* Top Navbar */}
        <nav className="flex-none pointer-events-auto flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-black tracking-widest text-red-600 drop-shadow-sm">
              SignalForge
            </h1>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex space-x-3">
              {tasks.map(task => (
                <button
                  key={task}
                  onClick={() => handleTaskChange(task)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                    appState.activeTask === task 
                      ? 'bg-red-500 text-white shadow-[0_4px_10px_rgba(239,68,68,0.3)] hover:bg-red-600 scale-105' 
                      : 'text-gray-600 bg-gray-100 hover:text-red-600 hover:bg-red-50 hover:shadow-md'
                  }`}
                >
                  {task}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Left Sidebar Controls */}
        <aside className="pointer-events-auto absolute top-28 left-8 w-80 p-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] flex flex-col space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5 border-b border-gray-200 pb-3 flex items-center">
              <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
              {appState.activeTask}
            </h2>
            
            <div className="space-y-5">
              {renderControls()}

              {/* Plot Button */}
              <button className="w-full mt-6 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md">
                PLOT SIGNAL
              </button>
            </div>
          </div>
        </aside>

        {/* Floating Instructions/Status or Exit Zoom button */}
        {appState.cameraView !== 'WIDE' ? (
          <button 
            onClick={handleExitZoom}
            className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm tracking-wide shadow-[0_10px_25px_rgba(239,68,68,0.45)] hover:shadow-[0_15px_30px_rgba(239,68,68,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300 ease-out flex items-center space-x-2"
          >
            <span>🔍</span>
            <span>EXIT ZOOM / VIEW 3D GRAPH</span>
          </button>
        ) : (
          <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg text-gray-600 text-sm font-medium">
            Drag the 3D lab environment to rotate. Click equipment to focus, or press <kbd className="bg-gray-100 border border-gray-300 shadow-sm px-2 py-1 rounded text-red-600 font-bold font-mono mx-1">F</kbd> to focus Oscilloscope.
          </div>
        )}
      </div>
    </main>
  );
}
