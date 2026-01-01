import { create } from 'zustand';

export const useGameStore = create((set) => ({
  inventory: [],
  gameStatus: 'intro', // 'intro', 'playing', 'caught', 'escaped'
  itemsFound: 0,
  
  collectItem: (item) => set((state) => ({ 
    inventory: [...state.inventory, item],
    itemsFound: state.itemsFound + 1 
  })),
  startGame: () => set({ gameStatus: 'playing' }),
  setGameOver: (status) => set({ gameStatus: status }),
}));
