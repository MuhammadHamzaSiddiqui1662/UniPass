import EditUniversityClient from "@/components/admin/EditUniversityClient";

export default async function EditUniversityPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditUniversityClient universityId={params.id} />;
}
