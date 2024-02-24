import React, { forwardRef, useId } from "react";
import FormField, { FormFieldProps } from "./form-field";
import { cn } from "~/lib/utils";
import { Controller, FieldValues, Path } from "react-hook-form";
import { useFormReturn } from "~/hooks/useForm";

export type SelectItem = {
  label: string;
  value: string;
};

type BaseSelectProps = React.ComponentPropsWithoutRef<"select"> &
  FormFieldProps & {
    inputClassName?: string;
    items?: SelectItem[] | null;
  };

const BaseSelect = forwardRef<HTMLSelectElement, BaseSelectProps>(
  (props, ref) => {
    const { className, label, error, inputClassName, items, ...restProps } =
      props;
    const id = useId();

    const input = (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/40 bg-transparent dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
          inputClassName
        )}
        {...restProps}
      >
        {items?.map((item) => (
          <option key={item.value} value={item.value} className="text-gray-900">
            {item.label}
          </option>
        ))}
      </select>
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

type SelectProps<T extends FieldValues> = Omit<
  BaseSelectProps,
  "form" | "name"
> & {
  form?: useFormReturn<T>;
  name?: Path<T>;
};

const Select = <T extends FieldValues>(props: SelectProps<T>) => {
  const { form, ...restProps } = props;

  if (form && props.name) {
    return (
      <Controller
        control={form.control}
        name={props.name}
        render={({ field, fieldState }) => (
          <BaseSelect
            {...restProps}
            {...field}
            value={field.value || ""}
            error={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return <BaseSelect {...restProps} />;
};

export default Select;
