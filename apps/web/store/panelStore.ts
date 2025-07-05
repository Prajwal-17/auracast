import { create } from "zustand";

type PanelStoreType = {
  isSidebarOpen: boolean,
  setIsSidebarOpen: () => void
}

export const usePanelStore = create<PanelStoreType>((set) => ({

  isSidebarOpen: true,

  setIsSidebarOpen: () => set((state) => ({
    isSidebarOpen: !state.isSidebarOpen
  }))
}))