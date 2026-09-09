import Link from "next/link";
import { signOut } from "@/lib/auth/auth";
import { GraphIcon, LogOutIcon, SettingsIcon, VaultIcon } from "@/components/vault/icons";

// Obsidian-style icon ribbon: core actions top, settings/account bottom.
export function Ribbon() {
  return (
    <aside className="w-10 shrink-0 border-r border-border bg-bg flex flex-col items-center py-2 gap-1">
      <Link
        href="/"
        aria-label="Open vault"
        title="Open vault"
        data-testid="ribbon-vault"
        className="w-7 h-7 flex items-center justify-center rounded-[2px] text-fg hover:bg-bg-hover transition-colors"
      >
        <VaultIcon />
      </Link>
      <button
        type="button"
        aria-disabled="true"
        disabled
        title="Graph — ships with the plugin system (Stage 6)"
        className="w-7 h-7 flex items-center justify-center rounded-[2px] text-fg-dim cursor-default"
      >
        <GraphIcon />
      </button>

      <div className="flex-1" />

      <button
        type="button"
        aria-disabled="true"
        disabled
        title="Settings — coming with the plugin system"
        className="w-7 h-7 flex items-center justify-center rounded-[2px] text-fg-dim cursor-default"
      >
        <SettingsIcon />
      </button>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/sign-in" });
        }}
      >
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="w-7 h-7 flex items-center justify-center rounded-[2px] text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors"
        >
          <LogOutIcon />
        </button>
      </form>
    </aside>
  );
}