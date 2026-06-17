import { execSync } from "child_process";
import { NextResponse } from "next/server";

/**
 * One-shot endpoint to run prisma migrate deploy + seed.
 * Hit this once after the first Vercel deploy to set up the database.
 * Protected by AUTH_SECRET so random visitors can't trigger it.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs: string[] = [];

  try {
    logs.push("Running prisma migrate deploy...");
    const migrate = execSync("npx prisma migrate deploy", {
      encoding: "utf-8",
      timeout: 30000,
    });
    logs.push(migrate);

    logs.push("Running seed...");
    const seed = execSync("npx tsx prisma/seed.ts", {
      encoding: "utf-8",
      timeout: 30000,
    });
    logs.push(seed);

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logs.push(`ERROR: ${message}`);
    return NextResponse.json({ success: false, logs }, { status: 500 });
  }
}
