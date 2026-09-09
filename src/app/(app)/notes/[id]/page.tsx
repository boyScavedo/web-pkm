import { Placeholder } from "@/components/layout/Placeholder";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  return <Placeholder title={`Note ${id}`} phase="Phase 3" />;
}