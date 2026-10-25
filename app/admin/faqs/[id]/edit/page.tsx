import EditFAQClient from "@/components/admin/EditFAQClient";

export default async function EditFAQPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditFAQClient faqId={params.id} />;
}
