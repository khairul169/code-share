import { useMutation, useQuery } from "@tanstack/react-query";
import Ansi from "ansi-to-react";
import { createId } from "@paralleldrive/cuid2";
import { useProjectContext } from "../context/project";
import { api } from "~/lib/api";
import Spinner from "~/components/ui/spinner";
import { useEffect, useState } from "react";
import { BASE_URL } from "~/lib/consts";
import { useSSE } from "~/hooks/useSSE";
import Divider from "~/components/ui/divider";
import { Button } from "~/components/ui/button";
import { FaCopy, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import ActionButton from "~/components/ui/action-button";
import { copy, getUrl } from "~/lib/utils";

const APIManager = () => {
  const { project } = useProjectContext();

  const stats = useQuery({
    queryKey: ["sandbox/stats", project.slug],
    queryFn: () => api(`/sandbox/${project.slug}/stats`),
    refetchInterval: 5000,
    retry: false,
  });

  const start = useMutation({
    mutationFn: () => api(`/sandbox/${project.slug}/start`, { method: "POST" }),
    onSuccess: () => stats.refetch(),
  });

  useEffect(() => {
    if (stats.error && (stats.error as any).code === 404 && start.isIdle) {
      start.mutate();
    }
  }, [stats.error, start.isIdle]);

  const onRetry = () => {
    if (start.isError) {
      start.mutate();
    } else if (!stats.data) {
      stats.refetch();
    }
  };

  if (stats.isLoading || start.isPending) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <Spinner />
        <p>
          {start.isPending
            ? "Starting up development sandbox..."
            : "Please wait..."}
        </p>
      </div>
    );
  }

  if (!stats.data || start.isError) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <p>Cannot load dev sandbox :(</p>
        {start.error?.message ? (
          <p className="text-sm mt-2">{start.error.message}</p>
        ) : null}

        <Button onClick={onRetry} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pt-2 h-full flex flex-col">
      <div className="flex gap-4 items-start">
        <Stats data={stats.data.result} />
        <Actions stats={stats} />
      </div>
      <Divider className="my-2" />

      <p className="text-sm mb-1">Output:</p>
      <Logs />
    </div>
  );
};

const Actions = ({ stats }: any) => {
  const { project } = useProjectContext();
  const restart = useMutation({
    mutationFn: () => {
      return api(`/sandbox/${project.slug}/restart`, { method: "POST" });
    },
    onSuccess: () => stats.refetch(),
  });
  const proxyUrl = `/api/sandbox/${project.slug}/proxy`;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => restart.mutate()}
        isLoading={restart.isPending}
        size="sm"
        className="h-8"
      >
        Restart
      </Button>
      <ActionButton
        icon={FaCopy}
        variant="outline"
        size="md"
        onClick={() => copy(proxyUrl)}
      />
      <ActionButton
        icon={FaExternalLinkAlt}
        variant="outline"
        size="md"
        onClick={() => window.open(getUrl(proxyUrl), "_blank")}
      />
    </div>
  );
};

const Stats = ({ data }: any) => {
  const { cpu, mem, memUsage, network, status, addr } = data;
  const [memUsed, memTotal] = memUsage || [];

  return (
    <div className="flex flex-col text-sm flex-1">
      <p>Status: {status}</p>
      <p>Address: {addr}</p>
      <p>CPU: {cpu}%</p>
      <p>
        Memory: {memUsed != null ? `${memUsed} / ${memTotal} (${mem}%)` : "-"}
      </p>
    </div>
  );
};

const Logs = () => {
  const { project } = useProjectContext();
  const url = BASE_URL + `/api/sandbox/${project.slug}/logs`;
  const [logs, setLogs] = useState<{ log: string; time: number; id: string }[]>(
    []
  );

  function onData(data: any) {
    setLogs((l) => [
      { ...data, log: data.log.replace(/[^\x00-\x7F]/g, ""), id: createId() },
      ...l,
    ]);
  }

  useSSE(url, onData);
  useEffect(() => {
    setLogs([]);
  }, [url]);

  return (
    <div className="w-full flex-1 shrink-0 bg-gray-900 p-4 overflow-y-auto flex flex-col-reverse gap-2 rounded-lg text-sm relative">
      <ActionButton
        icon={FaTimes}
        className="absolute top-1 right-2"
        onClick={() => setLogs([])}
      />

      {logs.map((log) => (
        <div
          key={log.id}
          className="border-t last:border-t-0 border-t-gray-800 pt-2"
        >
          {log.log.split("\n").map((line, idx) => (
            <Ansi key={idx} className="block">
              {line}
            </Ansi>
          ))}
        </div>
      ))}
    </div>
  );
};

export default APIManager;
