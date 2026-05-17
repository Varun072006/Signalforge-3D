/**
 * SignalForge 3D — Signal Math Engine
 * Pure mathematical functions for all 5 signal types.
 */

import { SignalParams } from "./signalState";

/** Unit Step: u(t) = A if t >= 0, else 0 */
export function computeUnitStep(t: number, A: number): number {
  return t >= 0 ? A : 0;
}

/** Unit Impulse: δ(t) ≈ tall narrow spike at t=0 */
export function computeUnitImpulse(t: number, A: number, epsilon: number = 0.05): number {
  return Math.abs(t) < epsilon ? A * 3 : 0;
}

/** Unit Ramp: r(t) = A·t·0.4 if t >= 0, else 0 */
export function computeUnitRamp(t: number, A: number): number {
  return t >= 0 ? A * t * 0.4 : 0;
}

/** Sinusoidal: A·sin(2πft + φ) */
export function computeSinusoidal(t: number, A: number, f: number, phi: number): number {
  return A * Math.sin(2 * Math.PI * f * t + phi);
}

/** Exponential: A·e^(αt) for t >= 0, else 0 */
export function computeExponential(t: number, A: number, alpha: number): number {
  return t >= 0 ? A * Math.exp(alpha * t) : 0;
}

/** Master dispatcher — compute signal value for any type */
export function computeSignal(type: string, t: number, params: SignalParams): number {
  switch (type) {
    case 'step':
      return computeUnitStep(t, params.A);
    case 'impulse':
      return computeUnitImpulse(t, params.A);
    case 'ramp':
      return computeUnitRamp(t, params.A);
    case 'sine':
      return computeSinusoidal(t, params.A, params.f, params.phi);
    case 'exp':
      return computeExponential(t, params.A, params.alpha);
    default:
      return computeSinusoidal(t, params.A, params.f, params.phi);
  }
}

/** Clamp utility */
export function clampSignal(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Get equation string for display */
export function getEquationString(type: string, params: SignalParams): string {
  const A = params.A.toFixed(2);
  const f = params.f.toFixed(2);
  const phi = params.phi.toFixed(2);
  const alpha = params.alpha.toFixed(2);

  switch (type) {
    case 'step':
      return `x(t) = ${A} * u(t)`;
    case 'impulse':
      return `x(t) = ${A} * d(t)`;
    case 'ramp':
      return `x(t) = ${A} * r(t)`;
    case 'sine':
      return `x(t) = ${A}*sin(2pi*${f}t + ${phi})`;
    case 'exp':
      return `x(t) = ${A}*exp(${alpha}*t)*u(t)`;
    default:
      return `x(t) = ?`;
  }
}

/** Get signal type display name */
export function getSignalDisplayName(type: string): string {
  switch (type) {
    case 'step': return 'UNIT STEP';
    case 'impulse': return 'UNIT IMPULSE';
    case 'ramp': return 'UNIT RAMP';
    case 'sine': return 'SINUSOIDAL';
    case 'exp': return 'EXPONENTIAL';
    default: return 'UNKNOWN';
  }
}

/** Check if signal is causal */
export function isCausal(type: string): boolean {
  return ['step', 'impulse', 'ramp', 'exp'].includes(type);
}

/** Get energy/power classification */
export function getClassification(type: string): string {
  switch (type) {
    case 'step': return 'Power Signal';
    case 'impulse': return 'Energy Signal';
    case 'ramp': return 'Neither';
    case 'sine': return 'Power Signal';
    case 'exp': return 'Energy Signal';
    default: return 'Unknown';
  }
}
