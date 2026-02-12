export default async function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Match Detail</h1>
      <p>clubId: {clubId}</p>
    </div>
  );
}
