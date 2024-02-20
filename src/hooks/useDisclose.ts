import { useCallback, useState } from "react";

export const useDisclose = <T = any>() => {
  const [isOpen, setOpen] = useState(false);
  const [data, setData] = useState<T | null | undefined>(null);

  const onOpen = useCallback(
    (_data?: T | null) => {
      setOpen(true);
      setData(_data);
    },
    [setOpen]
  );

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return { isOpen, onOpen, onClose, onChange: setOpen, data };
};

export type UseDiscloseReturn<T = any> = ReturnType<typeof useDisclose<T>>;
