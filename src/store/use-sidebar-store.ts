import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface SidebarState {
  // Estado collapsed del sidebar en desktop
  isCollapsed: boolean;

  // Acciones
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    immer((set) => ({
      isCollapsed: false,

      toggle: () =>
        set((state) => {
          state.isCollapsed = !state.isCollapsed;
        }),

      setCollapsed: (collapsed) =>
        set((state) => {
          state.isCollapsed = collapsed;
        }),
    })),
    {
      name: "sidebar-storage", // Key en localStorage
    }
  )
);
