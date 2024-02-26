import { useEffect } from "react";

export const useSSE = (url: string, onData: (data: any) => void) => {
  useEffect(() => {
    const sse = new EventSource(url, { withCredentials: true });

    sse.onmessage = (e) => {
      onData(JSON.parse(e.data));
    };

    sse.onerror = () => {
      console.log("err!");
      sse.close();
    };

    return () => {
      sse.close();
    };
  }, [url]);
};
