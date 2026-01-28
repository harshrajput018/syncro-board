import { NextResponse } from "next/server";

// Note: Real app mein ye database se aana chahiye
// Abhi ke liye hum placeholder data bhej rahe hain
export async function GET() {
  const initialData = {
    todo: { title: "To Do", items: [] },
    inProgress: { title: "In Progress", items: [] },
    done: { title: "Done", items: [] },
  };
  return NextResponse.json(initialData);
}
