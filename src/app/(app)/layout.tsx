import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Ribbon } from "@/components/vault/Ribbon";
import { FileExplorer } from "@/components/vault/FileExplorer";
import { TabStrip } from "@/components/vault/TabStrip";
import { StatusBar } from "@/components/vault/StatusBar";

// Obsidian 1:1 frame: ribbon | file explorer | tab strip + content | status bar.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      <div className="flex flex-1 min-h-0">
        <Ribbon />
        <FileExplorer />
        <div className="flex-1 flex flex-col min-w-0">
          <TabStrip />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}