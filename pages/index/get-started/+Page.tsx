import { Button } from "~/components/ui/button";
import Card, { CardTitle } from "~/components/ui/card";
import { FormLabel } from "~/components/ui/form-field";
import Input from "~/components/ui/input";
import { useData } from "~/renderer/hooks";
import { Data } from "./+data";
import { useForm } from "~/hooks/useForm";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { navigate } from "vike/client/router";
import Divider from "~/components/ui/divider";
import trpc from "~/lib/trpc";
import { useAuth } from "~/hooks/useAuth";
import { usePageContext } from "~/renderer/context";
import { useMemo } from "react";

const schema = z.object({
  forkFromId: z.number(),
  title: z.string(),
  user: z
    .object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
    })
    .optional(),
});

type Schema = z.infer<typeof schema>;

const GetStartedPage = () => {
  const { presets, forkFrom } = useData<Data>();
  const { isLoggedIn } = useAuth();
  const ctx = usePageContext();

  const initialValue: Schema = useMemo(
    () => ({
      forkFromId: forkFrom?.id || 0,
      title: forkFrom?.title || "",
    }),
    [forkFrom]
  );

  const form = useForm(schema, initialValue);
  const create = trpc.project.create.useMutation({
    onSuccess(data) {
      navigate(`/${data.slug}`);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(values);
  });

  return (
    <div className="container max-w-3xl min-h-[80dvh] flex flex-col items-center justify-center py-8 md:py-16">
      <Card className="w-full md:p-8">
        <CardTitle>{(forkFrom ? "Fork" : "Create New") + " Project"}</CardTitle>

        <form onSubmit={onSubmit}>
          {!forkFrom ? (
            <>
              <FormLabel>Select Preset</FormLabel>

              <Controller
                control={form.control}
                name="forkFromId"
                render={({ field }) => (
                  <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-x-hidden">
                    {presets.map((preset) => (
                      <Button
                        key={preset.projectId}
                        variant={
                          field.value === preset.projectId
                            ? "default"
                            : "outline"
                        }
                        className="flex py-16 border border-white/40 shrink-0 w-[160px] md:w-auto"
                        onClick={() => field.onChange(preset.projectId)}
                      >
                        <p className="text-wrap">{preset.title}</p>
                      </Button>
                    ))}
                  </div>
                )}
              />
            </>
          ) : null}

          <Input
            form={form}
            name="title"
            label="Title"
            placeholder="Optional"
            className="mt-4"
          />

          {!isLoggedIn ? (
            <div className="mt-8">
              <p className="text-lg">Account detail</p>
              <Divider className="mt-2 mb-4" />

              <div className="grid md:grid-cols-2 gap-x-2 gap-y-4">
                <div className="order-1 md:order-2 flex flex-col items-center justify-center gap-3 py-4">
                  <p className="text-center">Already have an account?</p>
                  <Button
                    href={`/auth/login?return=${encodeURI(ctx.urlPathname)}`}
                    variant="outline"
                  >
                    Log in now
                  </Button>
                </div>

                <div className="order-2 md:order-1 space-y-3">
                  <Input
                    form={form}
                    name="user.name"
                    label="Full Name"
                    placeholder="John Doe"
                  />
                  <Input
                    form={form}
                    name="user.email"
                    label="Email Address"
                    placeholder="john.doe@mail.com"
                  />
                  <Input
                    form={form}
                    type="password"
                    name="user.password"
                    label="Password"
                    placeholder="P@ssw0rd123!"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <Divider className="my-6" />

          <Button
            type="submit"
            size="lg"
            isLoading={create.isPending}
            className="w-full md:w-[160px]"
          >
            Create
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default GetStartedPage;
