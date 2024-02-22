import { useEffect, useState } from "react";
import { Console, Decode } from "console-feed";
import type { Message } from "console-feed/lib/definitions/Console";
import ErrorBoundary from "~/components/containers/error-boundary";

const ConsoleLogger = () => {
  const [logs, setLogs] = useState<any[]>([]);

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

      setLogs((i) => [data, ...i]);
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#242424] border-t border-t-gray-600">
      <p className="py-2 px-3 uppercase text-xs">Console</p>
      <ErrorBoundary>
        <div className="overflow-y-auto flex-1">
          <Console logs={logs} variant="dark" />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default ConsoleLogger;
