import React from "react";
import { cn } from "~/lib/utils";

export type FormFieldProps = {
  id?: string;
  label?: string;
  error?: string;
};

type Props = FormFieldProps & {
  children?: React.ReactNode;
  className?: string;
};

const FormField = ({ id, label, error, children, className }: Props) => {
  return (
    <div className={cn("form-field", className)}>
      {label ? <FormLabel htmlFor={id}>{label}</FormLabel> : null}

      {children}

      {error ? <p className="text-sm mt-1 text-red-500">{error}</p> : null}
    </div>
  );
};

export const FormLabel = ({
  className,
  ...props
}: React.ComponentProps<"label">) => (
  <label className={cn("text-sm block mb-2", className)} {...props} />
);

export default FormField;
