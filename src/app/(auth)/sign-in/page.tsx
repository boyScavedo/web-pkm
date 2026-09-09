import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/auth/auth";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-fg-dim mb-1">
            authentication required
          </p>
          <h1 className="text-[16px] font-semibold text-fg">~/pkm sign-in</h1>
        </div>

        <form
          className="flex flex-col gap-3"
          action={async (formData: FormData) => {
            "use server";
            await signIn("credentials", formData, { redirectTo: "/" });
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-fg-muted">email</span>
            <Input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-fg-muted">password</span>
            <Input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <Button type="submit" variant="primary" className="mt-2">
            sign in
          </Button>
        </form>

        <p className="mt-4 text-[11px] text-fg-dim">
          Single-user system. Credentials are configured via environment
          variables.
        </p>
      </Card>
    </div>
  );
}