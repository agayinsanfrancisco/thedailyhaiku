import { redirect } from "next/navigation";

// Old deep-link shape — funnel into the staged /write flow.
export default async function WriteDateRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { date } = await params;
  const { event } = await searchParams;
  redirect(`/write?date=${date}${event ? `&event=${event}` : ""}`);
}
