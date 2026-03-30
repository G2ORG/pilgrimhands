import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS, STATUS_COLORS,
  formatCurrency, formatDate, cn,
} from "@/lib/utils";
import type { Task, Offer } from "@/types";
import { OfferForm } from "./OfferForm";
import { AcceptOffer } from "./AcceptOffer";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      client:profiles!tasks_client_id_fkey(id, display_name, avatar_url),
      knight:profiles!tasks_knight_id_fkey(id, display_name, avatar_url),
      offers(
        *,
        knight:profiles!offers_knight_id_fkey(id, display_name, avatar_url, bio)
      )
    `)
    .eq("id", id)
    .single();

  if (!task) notFound();

  const isClient = user?.id === task.client_id;
  const isKnight = user?.id === task.knight_id;
  const hasOffer = user
    ? task.offers?.some((o: Offer) => o.knight_id === user.id)
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-4">
        <Link href="/tasks" className="text-crimson-600 hover:underline text-sm">
          ← Все задачи
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge bg-gray-100 text-gray-600 px-2 py-0.5">
                {CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]}{" "}
                {CATEGORY_LABELS[task.category as keyof typeof CATEGORY_LABELS]}
              </span>
              <span className={cn("badge px-2 py-0.5", STATUS_COLORS[task.status as keyof typeof STATUS_COLORS])}>
                {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
              </span>
              {task.is_remote && (
                <span className="badge bg-blue-50 text-blue-700 px-2 py-0.5">
                  🌐 Удалённо
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
              {task.title}
            </h1>

            {task.description && (
              <div className="prose text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            )}
          </div>

          {/* Offers */}
          {(isClient || isKnight) && task.offers && task.offers.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">
                Предложения ({task.offers.length})
              </h2>
              <div className="space-y-4">
                {(task.offers as Offer[]).map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-gray-100 rounded-lg p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-crimson-100 flex items-center justify-center text-crimson-700 font-bold text-sm shrink-0">
                        {offer.knight?.display_name?.[0] ?? "?"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {offer.knight?.display_name}
                        </div>
                        {offer.message && (
                          <p className="text-gray-500 text-sm mt-1">{offer.message}</p>
                        )}
                        {offer.eta_hours && (
                          <p className="text-gray-400 text-xs mt-1">
                            ⏱ {offer.eta_hours} ч.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-crimson-700 text-lg">
                        {formatCurrency(offer.price, task.currency)}
                      </div>
                      {isClient && task.status === "open" && (
                        <AcceptOffer offerId={offer.id} taskId={task.id} knightId={offer.knight_id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offer form */}
          {user && !isClient && task.status === "open" && !hasOffer && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Подать предложение</h2>
              <OfferForm taskId={task.id} currency={task.currency} />
            </div>
          )}

          {!user && task.status === "open" && (
            <div className="card text-center py-8">
              <p className="text-gray-600 mb-4">Войдите, чтобы подать предложение на эту задачу</p>
              <Link href={`/auth?redirectTo=/tasks/${task.id}`} className="btn-primary inline-block">
                Войти / Регистрация
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-medium text-gray-700 mb-4 text-sm uppercase tracking-wide">
              Детали задачи
            </h3>
            <dl className="space-y-3 text-sm">
              {task.budget && (
                <div>
                  <dt className="text-gray-500">Бюджет</dt>
                  <dd className="font-bold text-xl text-crimson-700">
                    {formatCurrency(task.budget, task.currency)}
                  </dd>
                </div>
              )}
              {task.location_name && (
                <div>
                  <dt className="text-gray-500">Место</dt>
                  <dd className="text-gray-800">📍 {task.location_name}</dd>
                </div>
              )}
              {task.deadline && (
                <div>
                  <dt className="text-gray-500">Дедлайн</dt>
                  <dd className="text-gray-800">📅 {formatDate(task.deadline)}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Опубликовано</dt>
                <dd className="text-gray-800">{formatDate(task.created_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Заказчик
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-crimson-100 flex items-center justify-center text-crimson-700 font-bold">
                {task.client?.display_name?.[0] ?? "?"}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {task.client?.display_name ?? "Аноним"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
