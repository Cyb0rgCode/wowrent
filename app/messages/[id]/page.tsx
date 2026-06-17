import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/MessageThread";

export const metadata = { title: "Conversation — wowRent" };

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  const convo = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      car: { select: { id: true, title: true } },
    },
  });

  if (
    !convo ||
    (convo.clientId !== user.id && convo.supplierId !== user.id)
  ) {
    notFound();
  }

  const other = convo.clientId === user.id ? convo.supplier : convo.client;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/messages" className="text-sm text-brand-600">
        ← All messages
      </Link>

      <div className="mt-3 card overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <p className="font-semibold">{other.name}</p>
          {convo.car && (
            <Link
              href={`/cars/${convo.car.id}`}
              className="text-xs text-brand-600"
            >
              Re: {convo.car.title}
            </Link>
          )}
        </div>
        <MessageThread conversationId={convo.id} currentUserId={user.id} />
      </div>
    </div>
  );
}
