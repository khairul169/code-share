import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

type Spinner = {
  className?: string;
};

const Spinner = ({ className }: Spinner) => {
  return <Loader2 className={cn("size-8 animate-spin", className)} />;
};

export default Spinner;
