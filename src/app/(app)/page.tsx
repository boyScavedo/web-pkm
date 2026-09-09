// Vault home: the empty workspace until a note is opened (editor lands in
// Stage 2, the file tree in Stage 1).
export default function VaultHome() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
      <p className="text-[13px] text-fg-muted">Select a note to open it.</p>
      <p className="text-[12px] text-fg-dim">Open one from the explorer, or create one with +.</p>
    </div>
  );
}