import { z } from "zod";
import { Button } from "~/components/ui/button";
import Card, { CardTitle } from "~/components/ui/card";
import Divider from "~/components/ui/divider";
import Input from "~/components/ui/input";
import { useForm } from "~/hooks/useForm";
import trpc from "~/lib/trpc";
import { useSearchParams } from "~/renderer/hooks";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const initialValue: z.infer<typeof schema> = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const form = useForm(schema, initialValue);
  const searchParams = useSearchParams();
  const login = trpc.auth.login.useMutation({
    onSuccess() {
      const prevPage = searchParams.get("return");
      window.location.href = prevPage || "/";
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <main className="container max-w-xl min-h-[80dvh] flex flex-col items-center justify-center py-8 md:py-16">
      <Card className="w-full md:p-8">
        <CardTitle>Log in</CardTitle>

        <form onSubmit={onSubmit}>
          <div className="space-y-3">
            <Input form={form} name="email" label="Email Address" />
            <Input
              form={form}
              type="password"
              name="password"
              label="Password"
            />
          </div>

          <Divider className="mt-8 mb-4" />

          <Button type="submit" isLoading={login.isPending}>
            Login
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default LoginPage;
