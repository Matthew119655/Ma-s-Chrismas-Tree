import { create } from 'zustand';
import { Phase, GestureType } from './types';

interface AppState {
  phase: Phase;
  gesture: GestureType;
  cameraActive: boolean;
  isMusicPlaying: boolean;
  
  setPhase: (phase: Phase) => void;
  setGesture: (gesture: GestureType) => void;
  setCameraActive: (active: boolean) => void;
  toggleCamera: () => void;
  setIsMusicPlaying: (playing: boolean) => void;
  toggleMusic: () => void;
}

export const useStore = create<AppState>((set) => ({
  phase: 'tree',
  gesture: 'None',
  cameraActive: false,
  isMusicPlaying: false,

  setPhase: (phase) => set({ phase }),
  setGesture: (gesture) => set({ gesture }),
  setCameraActive: (active) => set({ cameraActive: active }),
  toggleCamera: () => set((state) => ({ cameraActive: !state.cameraActive })),
  
  setIsMusicPlaying: (playing) => set({ isMusicPlaying: playing }),
  toggleMusic: () => set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),
}));
