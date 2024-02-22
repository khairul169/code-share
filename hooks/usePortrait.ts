import { useScreen } from "usehooks-ts";

export const usePortrait = () => {
  const screen = useScreen();
  const isPortrait = screen?.width < screen?.height;

  return isPortrait;
};
