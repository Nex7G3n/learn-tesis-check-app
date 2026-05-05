import { TesisDetailPage } from "@/src/modules/revisados/pages/tesis-detail-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TesisDetail({ params }: Props) {
  const { id } = await params;
  return <TesisDetailPage id={id} />;
}
