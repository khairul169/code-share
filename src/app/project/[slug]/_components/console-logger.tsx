/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useState } from "react";

const ConsoleLogger = forwardRef((_, ref: any) => {
  const [iframeLogs, setIframeLogs] = useState<any[]>([]);

  useEffect(() => {
    if (ref) {
      ref.current = {
        clear: () => setIframeLogs([]),
      };
    }

    const onMessage = (event: MessageEvent<any>) => {
      const { data } = event;
      if (!data) {
        return;
      }

      if (!["log", "warn", "error"].includes(data.type) || !data.args?.length) {
        return;
      }

      if (
        typeof data.args[0] === "string" &&
        data.args[0]?.includes("Babel transformer")
      ) {
        return;
      }

      setIframeLogs((i) => [data, ...i]);
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [ref]);

  return (
    <div className="pt-2 h-full border-t border-slate-700">
      <div className="flex flex-col-reverse overflow-y-auto items-stretch h-full font-mono text-slate-400">
        {iframeLogs.map((item, idx) => (
          <p
            key={idx}
            className="text-xs border-b border-slate-900 first:border-b-0 px-2 py-1"
          >
            {item.args
              ?.map((arg: any) => {
                if (typeof arg === "object") {
                  return JSON.stringify(arg, null, 2);
                }
                return arg;
              })
              .join(" ")}
          </p>
        ))}
      </div>
    </div>
  );
});

export default ConsoleLogger;
