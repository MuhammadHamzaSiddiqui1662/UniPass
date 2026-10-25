import EditProgramClient from "@/components/admin/EditProgramClient";

export default async function EditProgramPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditProgramClient programId={params.id} />;
}
