import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createSession } from "@/lib/auth";
import { supplierProfileSchema } from "@/lib/validations";
import { ok, badRequest, unauthorized, handleError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.supplierProfile) {
      return badRequest("You already have a supplier profile");
    }

    const data = supplierProfileSchema.parse(await req.json());

    await prisma.supplierProfile.create({
      data: {
        userId: user.id,
        type: data.type,
        businessName: data.businessName,
        bio: data.bio || null,
        location: data.location,
      },
    });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: user.role === "CLIENT" ? "SUPPLIER" : user.role },
    });

    // Refresh the session so the role claim reflects supplier status.
    await createSession({
      sub: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });

    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
