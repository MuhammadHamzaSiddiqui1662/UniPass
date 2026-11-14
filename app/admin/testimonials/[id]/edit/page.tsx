import TestimonialForm from "@/components/admin/TestimonialForm";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TestimonialForm testimonialId={id} />;
}
