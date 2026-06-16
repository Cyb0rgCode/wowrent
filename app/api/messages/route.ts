import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validations";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  handleError,
} from "@/lib/api";

async function assertParticipant(conversationId: string, userId: string) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, clientId: true, supplierId: true },
  });
  if (!convo) return { error: "notfound" as const };
  if (convo.clientId !== userId && convo.supplierId !== userId) {
    return { error: "forbidden" as const };
  }
  return { convo };
}

/**
 * GET ?conversationId=... — returns messages in order and marks the other
 * party's messages as read. Used for polling.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return badRequest("conversationId is required");

  const result = await assertParticipant(conversationId, user.id);
  if (result.error === "notfound") return notFound();
  if (result.error === "forbidden") return forbidden();

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, senderId: true, createdAt: true },
  });

  return ok({ messages, currentUserId: user.id });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { conversationId, body } = messageSchema.parse(await req.json());
    if (!conversationId) return badRequest("conversationId is required");

    const result = await assertParticipant(conversationId, user.id);
    if (result.error === "notfound") return notFound();
    if (result.error === "forbidden") return forbidden();

    const message = await prisma.message.create({
      data: { conversationId, senderId: user.id, body },
      select: { id: true, body: true, senderId: true, createdAt: true },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return ok({ message });
  } catch (err) {
    return handleError(err);
  }
}
