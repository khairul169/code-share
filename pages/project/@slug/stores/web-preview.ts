import { createStore } from "zustand";

type PreviewStore = {
  open: boolean;
  toggle: (toggle?: boolean) => void;
  refresh: () => void;
};

export const previewStore = createStore<PreviewStore>(() => ({
  open: false,
  toggle() {},
  refresh: () => {},
}));
