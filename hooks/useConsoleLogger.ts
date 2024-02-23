import { createStore, useStore } from "zustand";
import { Decode } from "console-feed";
import { useEffect } from "react";

type Store = {
  logs: any[];
};

const store = createStore<Store>(() => ({ logs: [] }));

export const useConsoleLogger = () => {
  useEffect(() => {
    const onMessage = (event: MessageEvent<any>) => {
      const { data: eventData } = event;
      if (!eventData || eventData.type !== "console") {
        return;
      }

      const data = Decode(eventData.data);
      if (!data || !data.method || !data.data) {
        return;
      }

      store.setState((i) => ({ logs: [data, ...i.logs] }));
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);
};

export const useConsoleLogs = () => useStore(store, (i) => i.logs);
