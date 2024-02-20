import { useCallback, useState } from "react";

export const useDisclose = () => {
  const [isOpen, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);

  const onOpen = useCallback(
    (_data?: any) => {
      setOpen(true);
      setData(data);
    },
    [setOpen]
  );

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return { isOpen, onOpen, onClose, onChange: setOpen, data };
};

export type UseDiscloseReturn = ReturnType<typeof useDisclose>;
