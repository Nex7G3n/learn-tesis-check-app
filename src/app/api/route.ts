import { NextResponse } from "next/server";

import {
  insightCards,
  reviewStages,
  valueMetrics,
} from "@/src/shared/application/thesis-review.snapshot";

export async function GET() {
  return NextResponse.json({
    stages: reviewStages,
    metrics: valueMetrics,
    insights: insightCards,
  });
}
