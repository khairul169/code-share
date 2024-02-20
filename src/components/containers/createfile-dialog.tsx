import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { UseDiscloseReturn } from "@/hooks/useDisclose";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "@/hooks/useForm";
import { z } from "zod";
import FormErrorMessage from "../ui/form-error-message";
import trpc from "@/lib/trpc";
import type { FileSchema } from "@/server/db/schema/file";

type Props = {
  disclose: UseDiscloseReturn;
  onSuccess?: (file: FileSchema, type: "create" | "update") => void;
};

const fileSchema = z.object({
  id: z.number().optional(),
  parentId: z.number().optional(),
  filename: z.string().min(1),
});

const defaultValues: z.infer<typeof fileSchema> = {
  filename: "",
};

const CreateFileDialog = ({ disclose, onSuccess }: Props) => {
  const form = useForm(fileSchema, disclose.data || defaultValues);
  const create = trpc.file.create.useMutation({
    onSuccess(data) {
      if (onSuccess) onSuccess(data, "create");
      disclose.onClose();
    },
  });
  const update = trpc.file.update.useMutation({
    onSuccess(data) {
      if (onSuccess) onSuccess(data, "update");
      disclose.onClose();
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (update.isPending || create.isPending) {
      return;
    }

    if (values.id) {
      update.mutate({ id: values.id!, ...values });
    } else {
      create.mutate(values);
    }
  });

  return (
    <Dialog open={disclose.isOpen} onOpenChange={disclose.onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create File</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FormErrorMessage form={form} />

          <Input
            placeholder="Filename"
            autoFocus
            {...form.register("filename")}
          />

          <div className="flex justify-end gap-4 mt-4">
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFileDialog;
