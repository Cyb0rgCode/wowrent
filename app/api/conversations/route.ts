import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, badRequest, unauthorized, handleError } from "@/lib/api";

/**
 * Finds or creates a conversation between the current user (client) and a
 * supplier, optionally scoped to a car.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { supplierId, carId } = (await req.json()) as {
      supplierId: string;
      carId?: string;
    };
    if (!supplierId) return badRequest("supplierId is required");
    if (supplierId === user.id) {
      return badRequest("You cannot message yourself");
    }

    const supplier = await prisma.user.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });
    if (!supplier) return badRequest("Supplier not found");

    const existing = await prisma.conversation.findFirst({
      where: {
        clientId: user.id,
        supplierId,
        carId: carId ?? null,
      },
    });
    if (existing) return ok({ id: existing.id });

    const conversation = await prisma.conversation.create({
      data: {
        clientId: user.id,
        supplierId,
        carId: carId ?? null,
      },
    });
    return ok({ id: conversation.id });
  } catch (err) {
    return handleError(err);
  }
}
