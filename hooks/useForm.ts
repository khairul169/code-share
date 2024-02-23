import { z } from "zod";
import { useForm as useHookForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

export const useForm = <T extends FieldValues>(
  schema: z.ZodSchema<T>,
  initialValues?: Partial<T>
) => {
  const form = useHookForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialValues as never,
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues as never);
    }
  }, [initialValues, form.reset]);

  return form;
};

export type useFormReturn<T extends FieldValues> = ReturnType<
  typeof useForm<T>
>;
