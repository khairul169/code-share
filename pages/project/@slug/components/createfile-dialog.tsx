import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { UseDiscloseReturn } from "~/hooks/useDisclose";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { useForm } from "~/hooks/useForm";
import { z } from "zod";
import FormErrorMessage from "../../../../components/ui/form-error-message";
import trpc from "~/lib/trpc";
import type { FileSchema } from "~/server/db/schema/file";
import { useWatch } from "react-hook-form";

type Props = {
  disclose: UseDiscloseReturn<CreateFileSchema>;
  onSuccess?: (file: FileSchema, type: "create" | "update") => void;
};

const fileSchema = z.object({
  id: z.number().optional(),
  parentId: z.number().optional().nullable(),
  filename: z.string().min(1),
  isDirectory: z.boolean().optional(),
});

export type CreateFileSchema = z.infer<typeof fileSchema>;

const defaultValues: z.infer<typeof fileSchema> = {
  filename: "",
};

const CreateFileDialog = ({ disclose, onSuccess }: Props) => {
  const form = useForm(fileSchema, disclose.data || defaultValues);
  const isDir = useWatch({ name: "isDirectory", control: form.control });

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
          <DialogTitle>
            {[
              !disclose.data?.id ? "Create" : "Rename",
              isDir ? "Directory" : "File",
            ].join(" ")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FormErrorMessage form={form} />

          <Input
            placeholder={isDir ? "Directory Name" : "Filename"}
            autoFocus
            {...form.register("filename")}
          />

          <div className="flex justify-end gap-4 mt-4">
            <Button size="sm" variant="ghost" onClick={disclose.onClose}>
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
