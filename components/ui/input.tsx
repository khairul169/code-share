import { ForwardedRef, forwardRef, useId } from "react";
import { Controller, FieldValues, Path } from "react-hook-form";
import { useFormReturn } from "~/hooks/useForm";
import { cn } from "~/lib/utils";
import FormField, { FormFieldProps } from "./form-field";

export type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  FormFieldProps & {
    inputClassName?: string;
  };

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ className, inputClassName, type, label, error, ...props }, ref) => {
    const id = useId();

    const input = (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/40 dark:bg-background dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
          inputClassName
        )}
        ref={ref}
        {...props}
      />
    );

    if (label || error) {
      return (
        <FormField
          id={id}
          label={label}
          error={error}
          className={className}
          children={input}
        />
      );
    }

    return input;
  }
);
BaseInput.displayName = "BaseInput";

type InputProps<T extends FieldValues> = Omit<
  BaseInputProps,
  "form" | "name"
> & {
  form?: useFormReturn<T>;
  name?: Path<T>;
};

const Input = <T extends FieldValues>(props: InputProps<T>) => {
  const { form, ...restProps } = props;

  if (form && props.name) {
    return (
      <Controller
        control={form.control}
        name={props.name}
        render={({ field, fieldState }) => (
          <BaseInput
            {...restProps}
            {...field}
            value={field.value || ""}
            error={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return <BaseInput {...restProps} />;
};

export { BaseInput };
export default Input;
