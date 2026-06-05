import { NextResponse } from "next/server";
import { getFlexCoreAccessPayload } from "@/features/gkli-core/flex-access";

export async function GET() {
  return NextResponse.json(await getFlexCoreAccessPayload());
}
