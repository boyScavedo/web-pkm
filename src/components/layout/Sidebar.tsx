import Link from "next/link";

const paraItems = [
  { label: "Inbox", href: "/notes?para=inbox", icon: "⊡" },
  { label: "Projects", href: "/notes?para=project", icon: "▣" },
  { label: "Areas", href: "/notes?para=area", icon: "▢" },
  { label: "Resources", href: "/notes?para=resource", icon: "◇" },
  { label: "Archives", href: "/notes?para=archive", icon: "▧" },
];

const navItems = [
  { label: "All Notes", href: "/notes", icon: "📄" },
  { label: "Tags", href: "/tags", icon: "#" },
  { label: "Folders", href: "/folders", icon: "▸" },
  { label: "Projects", href: "/projects", icon: "●" },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-bg h-screen flex flex-col">
      <div className="px-3 py-3 border-b border-border">
        <Link href="/" className="text-[13px] font-semibold text-fg">
          ~/pkm
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 text-[13px]">
        <p className="px-3 pb-1 text-[11px] uppercase tracking-wider text-fg-dim">
          PARA
        </p>
        <ul>
          {paraItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 px-3 py-1.5 text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors"
              >
                <span className="text-accent w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="px-3 pt-4 pb-1 text-[11px] uppercase tracking-wider text-fg-dim">
          System
        </p>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 px-3 py-1.5 text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors"
              >
                <span className="text-accent w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-2 border-t border-border text-[11px] text-fg-dim">
        v0.1.0 · pkm
      </div>
    </aside>
  );
}