import { NextResponse } from "next/server";
import { getColabCoreAccessPayload } from "@/features/gkli-core/colab-access";

export async function GET() {
  return NextResponse.json(await getColabCoreAccessPayload());
}
