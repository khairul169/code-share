import { createStore } from "zustand";

type PreviewStore = {
  refresh: () => void;
};

export const previewStore = createStore<PreviewStore>(() => ({
  refresh: () => {},
}));
