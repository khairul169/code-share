import { Console } from "console-feed";
import ErrorBoundary from "~/components/containers/error-boundary";
import { useConsoleLogs } from "~/hooks/useConsoleLogger";

const ConsoleLogger = () => {
  const logs = useConsoleLogs();

  return (
    <div className="h-full flex flex-col bg-[#242424] border-t border-gray-700">
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
