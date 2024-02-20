/* eslint-disable react/display-name */
import Panel from "@/components/ui/panel";
import React, { forwardRef, useCallback, useEffect, useRef } from "react";

type Props = {};

const WebPreview = forwardRef((props: Props, ref: any) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const refresh = useCallback(() => {
    if (frameRef.current) {
      frameRef.current.src = `/api/file/index.html?index=true`;
    }
  }, []);

  useEffect(() => {
    if (ref) {
      ref.current = { refresh };
    }
  }, [ref, refresh]);

  return (
    <Panel>
      <iframe
        ref={frameRef}
        className="border-none w-full h-full bg-white"
        sandbox="allow-scripts"
      />
    </Panel>
  );
});

export default WebPreview;
