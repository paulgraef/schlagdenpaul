import { AdminGameDetailClient } from "@/components/admin/admin-game-detail-page";

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, index) => ({
    gameId: `game_${index + 1}`
  }));
}

export default async function AdminGameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return <AdminGameDetailClient gameId={gameId} />;
}
