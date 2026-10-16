import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePreferencesStore = create(persist((set) => ({
  cardLayout: 'grid',
  animationsEnabled: true,
  blurEnabled: true,
  setCardLayout: (cardLayout) => set({ cardLayout }),
  setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
  setBlurEnabled: (blurEnabled) => set({ blurEnabled }),
}), { name: 'revilo-preferences' }));

export default usePreferencesStore;
