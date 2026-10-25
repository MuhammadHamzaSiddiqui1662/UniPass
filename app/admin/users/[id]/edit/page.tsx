import EditUserClient from "@/components/admin/EditUserClient";

export default async function EditUserPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditUserClient userId={params.id} />;
}
