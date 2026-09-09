import { Card } from "@/components/ui/Card";

export function Placeholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="p-4">
      <h1 className="text-[16px] font-semibold text-fg mb-4">{title}</h1>
      <Card className="p-8 text-center">
        <p className="text-[13px] text-fg-muted">
          {title} ships in {phase}.
        </p>
      </Card>
    </div>
  );
}