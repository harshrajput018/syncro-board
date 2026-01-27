import { pusherServer } from "@/lib/pusherServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { newColumns } = await req.json();
  
  await pusherServer.trigger("board-updates", "card-moved", {
    newColumns,
  });

  return NextResponse.json({ success: true });
}
