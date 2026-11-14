import GuideForm from "@/components/admin/GuideForm";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuideForm guideId={id} />;
}
