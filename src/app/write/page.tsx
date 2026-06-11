import WriteFlow from "@/components/WriteFlow";

export const dynamic = "force-dynamic";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; event?: string }>;
}) {
  const { date, event } = await searchParams;
  return <WriteFlow initialDate={date} initialEvent={event ? Number(event) : undefined} />;
}
