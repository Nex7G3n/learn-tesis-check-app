import { NextResponse } from "next/server";

import {
  exampleFindings,
  exampleResponseSections,
} from "@/src/shared/application/thesis-review.snapshot";

export async function GET() {
  return NextResponse.json({
    sections: exampleResponseSections,
    findings: exampleFindings,
  });
}
