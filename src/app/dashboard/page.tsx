import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  STATUS_LABELS, STATUS_COLORS, CATEGORY_ICONS, CATEGORY_LABELS,
  formatCurrency, formatDate, cn,
} from "@/lib/utils";
import type { Task } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Tasks as client
  const { data: clientTasks = [] } = await supabase
    .from("tasks")
    .select("*, offers(count)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Tasks as knight
  const { data: knightTasks = [] } = await supabase
    .from("tasks")
    .select("*, client:profiles!tasks_client_id_fkey(id, display_name)")
    .eq("knight_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Кабинет
          </h1>
          <p className="text-gray-500 mt-1">
            {profile?.display_name ?? user.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/tasks/new" className="btn-primary">
            + Задача
          </Link>
          <form action={handleSignOut}>
            <button type="submit" className="btn-secondary text-sm px-4 py-2">
              Выйти
            </button>
          </form>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Мои задачи", value: clientTasks.length, icon: "📝" },
          { label: "Как рыцарь", value: knightTasks.length, icon: "⚔️" },
          { label: "Роль", value: profile?.role ?? "client", icon: "👤" },
          { label: "Статус", value: "Активен", icon: "✅" },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-crimson-700">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Client tasks */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-gray-900">Мои задачи (заказчик)</h2>
          <Link href="/tasks/new" className="text-crimson-600 hover:underline text-sm">
            + Новая задача
          </Link>
        </div>
        {clientTasks.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            <p>Вы ещё не создавали задач.</p>
            <Link href="/tasks/new" className="btn-primary inline-block mt-4">
              Создать первую задачу
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(clientTasks as Task[]).map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="card hover:shadow-md hover:border-crimson-200 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("badge text-xs px-2 py-0.5", STATUS_COLORS[task.status])}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {CATEGORY_ICONS[task.category]} {CATEGORY_LABELS[task.category]}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900 truncate">{task.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(task.created_at)}</div>
                </div>
                <div className="text-right shrink-0">
                  {task.budget && (
                    <div className="font-bold text-crimson-700">{formatCurrency(task.budget, task.currency)}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Knight tasks */}
      {knightTasks.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
            Мои задания (рыцарь)
          </h2>
          <div className="space-y-3">
            {(knightTasks as Task[]).map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="card hover:shadow-md hover:border-crimson-200 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className={cn("badge text-xs px-2 py-0.5 mb-1 inline-block", STATUS_COLORS[task.status])}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <div className="font-medium text-gray-900 truncate">{task.title}</div>
                </div>
                {task.budget && (
                  <div className="font-bold text-crimson-700 shrink-0">
                    {formatCurrency(task.budget, task.currency)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Knight onboarding CTA */}
      {(!profile?.role || profile.role === "client") && (
        <div className="mt-10 bg-crimson-50 border border-crimson-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">⚔️</div>
          <h3 className="font-serif text-xl font-bold text-crimson-900 mb-2">
            Станьте рыцарем Ордена
          </h3>
          <p className="text-crimson-700 text-sm mb-4">
            Выполняйте задачи для паломников и зарабатывайте, помогая людям по всему миру.
          </p>
          <Link href="/knight-onboarding" className="btn-primary inline-block">
            Подать заявку
          </Link>
        </div>
      )}
    </div>
  );
}
