import React, { forwardRef, useId } from "react";
import FormField, { FormFieldProps } from "./form-field";
import { cn } from "~/lib/utils";
import { Controller, FieldValues, Path } from "react-hook-form";
import { useFormReturn } from "~/hooks/useForm";

export type CheckboxItem = {
  label: string;
  value: string;
};

type BaseCheckboxProps = React.ComponentPropsWithoutRef<"input"> &
  FormFieldProps & {
    inputClassName?: string;
    items?: CheckboxItem[] | null;
  };

const BaseCheckbox = forwardRef<HTMLInputElement, BaseCheckboxProps>(
  (props, ref) => {
    const { className, label, error, inputClassName, items, ...restProps } =
      props;
    const id = useId();

    const input = (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          className
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          {...restProps}
          className={inputClassName}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );

    if (error) {
      return <FormField id={id} error={error} children={input} />;
    }

    return input;
  }
);

type CheckboxProps<T extends FieldValues> = Omit<
  BaseCheckboxProps,
  "form" | "name"
> & {
  form?: useFormReturn<T>;
  name?: Path<T>;
};

const Checkbox = <T extends FieldValues>(props: CheckboxProps<T>) => {
  const { form, ...restProps } = props;

  if (form && props.name) {
    return (
      <Controller
        control={form.control}
        name={props.name}
        render={({ field, fieldState }) => (
          <BaseCheckbox
            {...restProps}
            {...field}
            checked={field.value}
            error={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return <BaseCheckbox {...restProps} />;
};

export default Checkbox;
