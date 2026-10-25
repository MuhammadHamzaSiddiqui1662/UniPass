import EditGuideClient from "@/components/admin/EditGuideClient";

export default async function EditGuidePage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditGuideClient guideId={params.id} />;
}
