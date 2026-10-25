import EditTestimonialClient from "@/components/admin/EditTestimonialClient";

export default async function EditTestimonialPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await rawParams;
  return <EditTestimonialClient testimonialId={params.id} />;
}
