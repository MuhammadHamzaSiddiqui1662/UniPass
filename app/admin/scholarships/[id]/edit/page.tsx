import EditScholarshipClient from "@/components/admin/EditScholarshipClient";

export default async function EditScholarshipPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditScholarshipClient scholarshipId={params.id} />;
}
