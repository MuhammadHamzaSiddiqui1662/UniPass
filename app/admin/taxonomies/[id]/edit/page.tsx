import EditTaxonomyClient from "@/components/admin/EditTaxonomyClient";

export default async function EditTaxonomyPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditTaxonomyClient taxonomyId={params.id} />;
}
