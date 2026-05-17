/**
 * SignalForge 3D — Central Signal State Manager
 * All interactive modules subscribe to state changes via this singleton.
 */

export interface SignalParams {
  A: number;
  f: number;
  phi: number;
  alpha: number;
}

export interface SignalState {
  type: 'step' | 'impulse' | 'ramp' | 'sine' | 'exp';
  params: SignalParams;
  discrete: boolean;
  Ts: number;
  challengeMode: boolean;
  overlayActive: boolean;
}

export type SignalStateListener = (state: SignalState) => void;

class SignalStateManager {
  private state: SignalState = {
    type: 'sine',
    params: { A: 1.0, f: 1.0, phi: 0, alpha: -0.5 },
    discrete: false,
    Ts: 0.2,
    challengeMode: false,
    overlayActive: false,
  };

  private listeners: SignalStateListener[] = [];

  get(): SignalState {
    return {
      ...this.state,
      params: { ...this.state.params },
    };
  }

  update(partial: Partial<SignalState>): void {
    if (partial.params) {
      this.state.params = { ...this.state.params, ...partial.params };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { params, ...rest } = partial;
      Object.assign(this.state, rest);
    } else {
      Object.assign(this.state, partial);
    }
    const snapshot = this.get();
    this.listeners.forEach(fn => fn(snapshot));
  }

  subscribe(fn: SignalStateListener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}

export const signalState = new SignalStateManager();
