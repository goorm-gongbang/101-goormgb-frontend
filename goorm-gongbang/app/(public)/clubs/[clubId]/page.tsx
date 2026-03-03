"use client";

import * as React from "react";

export default function ClubDetailPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = React.use(params);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Match Detail</h1>
      <p>clubId: {clubId}</p>
    </div>
  );
}
