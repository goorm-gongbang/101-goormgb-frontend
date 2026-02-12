"use client";

import * as React from "react";

export default function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = React.use(params);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Match Detail</h1>
      <p>matchId: {matchId}</p>
    </div>
  );
}
