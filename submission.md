# SignalForge 3D

## Problem Statement Fit

We selected "Signal representation using orthogonal basis" from the Electronics and
Communication Engineering domain. Our simulation directly addresses all 9 functional
specifications: Signal Selection Hub (5 signal types), Real-time Parameter Manipulation
(rotary knobs for A, f, φ), Coordinate Workspace (3D Cartesian grid with Z=time,
Y=amplitude), Continuous vs Discrete Toggle (stem plot mode), Dynamic Data Visualization
(live equation on oscilloscope screen), Event-Driven Impulse Trigger (fire button),
Time-Scaling Interaction (timeScale knob), Multi-Signal Overlay (dual wave rendering),
and Collaborative Signal Review (challenge mode with instructor-defined target).

## Target Users

ECE and EEE students aged 16–24 who struggle to connect signal theory (equations on paper)
to physical understanding (what the signal actually looks like and does). Students in
Tier-2 colleges who lack access to physical signal generators and oscilloscopes benefit
most — this simulation replaces ₹50,000 worth of lab equipment with a browser tab.

## What We Built

A 3D virtual electronics lab in Babylon.js where students enter a realistic lab room,
see a physical Function Generator and Oscilloscope on a workbench, interact with physical
rotary knobs to generate Unit Step, Impulse, Ramp, Sinusoidal, and Exponential signals,
watch a holographic waveform rise above the table in 3D space, and complete a challenge
to match an unknown exponential decay rate — all without touching real hardware.

## Core Features

- 3D virtual electronics lab room with Function Generator, Oscilloscope, and BNC cable
- Interactive rotary knobs that physically rotate and change signal parameters in real time
- Holographic 3D waveform above the workbench with glow pass rendering
- Continuous and Discrete (stem plot) mode with animated physical toggle switch
- Live oscilloscope screen with waveform trace and mathematical equation display
- Signal overlay: two signals visible simultaneously with independent traces
- Challenge Mode: match a shadow exponential wave by adjusting the decay knob —
  lab floor pulses green on success
- 5-step guided onboarding tour with floating holographic tooltips
- Signal analytics panel: amplitude, frequency, period, energy classification, causality

## Technical Architecture

The simulation is a single Next.js page powered by Babylon.js, structured in five layers:

Layer 1 — Environment: MeshBuilder primitives form the room, workbench, and equipment.
GridMaterial creates the glowing lab floor grid.

Layer 2 — Equipment: Function Generator, Oscilloscope, BNC cable, breadboard, and
decorative elements — all built from primitive meshes.

Layer 3 — Signal Engine: Pure TypeScript functions compute signal values for any t.
HolographicWaveRenderer samples 325 points and builds a LineSystem with glow pass.
Discrete mode replaces the LineSystem with cylinder stems and sphere tips.

Layer 4 — Displays: DynamicTextures render live equations on the oscilloscope CRT,
signal statistics on the info panel, and challenge progress on the challenge board.

Layer 5 — Interaction: ActionManager and pointer observables on knob meshes map mouse
drag distance to parameter value changes. Central SignalStateManager broadcasts changes
to all subscribers. All updates dispose old meshes before creating new ones to prevent
memory leaks.

## Tech Stack

- Babylon.js 8.56.2 — 3D rendering engine
- TypeScript — all simulation logic
- Babylon.js DynamicTexture — labels, oscilloscope screen, info panels
- Babylon.js GridMaterial — lab floor grid effect
- Next.js 16 — app framework and deployment
- CreatorEngine — build, preview, and publish platform
- Node.js + npm — project toolchain
- GitHub — version control

## Innovation / Uniqueness

No other team is building a lab. Every other signal visualization entry will show a
2D chart with HTML sliders. We built physical equipment — knobs you grab, cables that
glow, an oscilloscope screen that traces in real time. The educational gap this bridges
is not "I do not understand the equation" — it is "I cannot visualize it physically."
Our simulation makes signal theory tangible at zero hardware cost.

## Demo Instructions

1. Open the live URL in any Chrome or Firefox browser (no install required)
2. The onboarding tour starts automatically — read the holographic tooltips
   or click SKIP TOUR
3. Click "SINE" in the Signal Hub on the left
4. Grab the FREQ knob on the Function Generator and drag up/down — watch the
   holographic wave tighten or stretch
5. Click the D/C toggle switch — the wave becomes a stem plot
6. Click "OVERLAY B" to add a second signal in coral
7. Click "CHALLENGE" — a purple shadow wave appears
8. Drag the DECAY knob until the match meter hits 100% — the floor glows green
9. Press F to focus on oscilloscope, G for holographic wave, R to reset camera

## Known Limitations

- On low-end devices, discrete mode with Ts < 0.1 may drop below 50 FPS due to
  the high stem mesh count — adaptive quality reduces sample count automatically
- Multi-user instructor marker placement is designed but not yet networked —
  the marker system works locally

## Future Work

- WebXR full controller interaction so students can walk through the signal time-tunnel
- Real oscilloscope FFT display showing frequency spectrum alongside time domain
- Network sync so instructor and student share the same lab session in real time
- More signal types: triangular, square wave, chirp signals
- Export feature: download the session Signal Map as a PDF lab report
