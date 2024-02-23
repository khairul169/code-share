import { createStore } from "zustand";

type SidebarStore = {
  expanded: boolean;
  toggle: (toggle?: boolean) => void;
};

export const sidebarStore = createStore<SidebarStore>(() => ({
  expanded: false,
  toggle() {},
}));
