import { useForm } from "~/hooks/useForm";
import { FieldValues } from "react-hook-form";
import React from "react";

type Props<T extends FieldValues> = {
  form: ReturnType<typeof useForm<T>>;
};

const FormErrorMessage = <T extends FieldValues>({ form }: Props<T>) => {
  const { errors } = form.formState;
  const error = Object.entries(errors)[0];
  if (!error) {
    return null;
  }

  const [key, { message }] = error as any;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-md px-4 py-2 text-sm mb-4">
      {`${key}: ${message}`}
    </div>
  );
};

export default FormErrorMessage;
