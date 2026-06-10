import WriteDateClient from "./WriteDateClient";

export default async function WriteDatePage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { date } = await params;
  const { event } = await searchParams;
  return <WriteDateClient date={date} initialEventId={Number(event) || null} />;
}
