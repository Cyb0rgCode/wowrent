import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Messages — wowRent" };

export default async function MessagesPage() {
  const t = getDict();
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ clientId: user.id }, { supplierId: user.id }] },
    include: {
      client: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      car: { select: { title: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: { where: { readAt: null, senderId: { not: user.id } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t.messages.title}</h1>

      {conversations.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-gray-500">
          {t.messages.empty}
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {conversations.map((c) => {
            const other = c.clientId === user.id ? c.supplier : c.client;
            const last = c.messages[0];
            const unread = c._count.messages;
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                    {other.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{other.name}</p>
                      {last && (
                        <span className="text-xs text-gray-400">
                          {formatDateTime(last.createdAt)}
                        </span>
                      )}
                    </div>
                    {c.car && (
                      <p className="text-xs text-gray-400">
                        {t.messages.rePrefix} {c.car.title}
                      </p>
                    )}
                    <p className="truncate text-sm text-gray-500">
                      {last ? last.body : t.messages.noMessagesYet}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
