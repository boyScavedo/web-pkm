import { signOut } from "@/lib/auth/auth";
import { Button } from "@/components/ui/Button";

export function Topbar() {
  return (
    <header className="h-12 shrink-0 border-b border-border bg-bg flex items-center gap-3 px-4">
      <span className="text-[13px] text-fg-muted hidden sm:inline">
        ~/pkm
      </span>
      <span className="text-fg-dim text-[13px] hidden sm:inline">/</span>
      <span className="text-[13px] text-accent">&gt;_</span>

      <div className="flex-1" />

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/sign-in" });
        }}
      >
        <Button type="submit" variant="ghost">
          sign out
        </Button>
      </form>
    </header>
  );
}