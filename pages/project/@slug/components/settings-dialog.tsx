import { useStore } from "zustand";
import { settingsDialog } from "../stores/dialogs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMemo, useState } from "react";
import { useProjectContext } from "../context/project";
import { useForm, useFormReturn } from "~/hooks/useForm";
import Input from "~/components/ui/input";
import Select from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { ProjectSettingsSchema, projectSettingsSchema } from "../lib/schema";
import {
  cssPreprocessorList,
  jsTranspilerList,
  visibilityList,
} from "../lib/consts";
import trpc from "~/lib/trpc";
import { toast } from "~/lib/utils";
import Checkbox from "~/components/ui/checkbox";
import Tabs, { Tab } from "~/components/ui/tabs";
import { navigate } from "vike/client/router";

const defaultValues: ProjectSettingsSchema = {
  title: "",
  //   slug: "",
  visibility: "private",

  settings: {
    css: {
      preprocessor: null,
      tailwindcss: false,
    },
    js: {
      transpiler: null,
      packages: [],
    },
  },
};

const SettingsDialog = () => {
  const { project } = useProjectContext();
  const [tab, setTab] = useState(0);
  const initialValues = useMemo(() => {
    return Object.assign(defaultValues, {
      title: project.title,
      settings: project.settings,
      visibility: project.visibility,
    });
  }, [project]);

  const open = useStore(settingsDialog);
  const form = useForm(projectSettingsSchema, initialValues);
  const save = trpc.project.update.useMutation({
    onSuccess(data) {
      toast.success("Project updated!");
      onClose();
      if (data.slug !== project.slug) {
        navigate(`/${data.slug}`);
      }
    },
  });

  const onClose = () => {
    settingsDialog.setState(false);
  };

  const onSubmit = form.handleSubmit((values) => {
    save.mutate({ ...values, id: project.id });
  });

  const tabs: Tab[] = useMemo(
    () => [
      {
        title: "General",
        render: () => <GeneralTab form={form} />,
      },
      {
        title: "CSS",
        render: () => <CSSTab form={form} />,
      },
      {
        title: "Javascript",
        render: () => <JSTab form={form} />,
      },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={settingsDialog.setState}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} method="post">
          <Tabs
            tabs={tabs}
            current={tab}
            onChange={setTab}
            containerClassName="mt-4"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-4 mt-8">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

type TabProps = {
  form: useFormReturn<ProjectSettingsSchema>;
};

const GeneralTab = ({ form }: TabProps) => {
  return (
    <div className="space-y-3">
      <Input form={form} name="title" label="Title" />
      {/* <Input form={form} name="slug" label="Slug" /> */}
      <Select
        form={form}
        name="visibility"
        label="Visibility"
        items={visibilityList}
      />
    </div>
  );
};

const CSSTab = ({ form }: TabProps) => {
  return (
    <div className="space-y-3">
      <Select
        form={form}
        name="settings.css.preprocessor"
        label="Preprocessor"
        items={cssPreprocessorList}
      />
      <Checkbox
        form={form}
        name="settings.css.tailwindcss"
        label="Tailwindcss"
      />
    </div>
  );
};

const JSTab = ({ form }: TabProps) => {
  return (
    <div className="space-y-3">
      <Select
        form={form}
        name="settings.js.transpiler"
        label="Transpiler"
        items={jsTranspilerList}
      />
      <p className="text-sm">
        * Set transpiler to <strong>SWC</strong> to use JSX
      </p>
    </div>
  );
};

export default SettingsDialog;
