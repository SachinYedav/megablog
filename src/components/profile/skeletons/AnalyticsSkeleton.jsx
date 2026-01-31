import React from "react";
import Skeleton from "../../Skeleton";

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height="140px" className="rounded-2xl" />
        ))}
      </div>
      <Skeleton width="100%" height="350px" className="rounded-3xl" />
      <Skeleton width="100%" height="300px" className="rounded-3xl" />
    </div>
  );
}