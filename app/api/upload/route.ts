import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { ok, badRequest, unauthorized, handleError } from "@/lib/api";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Stores uploaded images under public/uploads and returns their public URLs.
 * MVP-only: swap for S3/object storage in production.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) return badRequest("No files uploaded");

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        return badRequest(`Unsupported file type: ${file.type}`);
      }
      if (file.size > MAX_BYTES) {
        return badRequest("Each image must be under 5 MB");
      }
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const name = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, name), buffer);
      urls.push(`/uploads/${name}`);
    }

    return ok({ urls });
  } catch (err) {
    return handleError(err);
  }
}
