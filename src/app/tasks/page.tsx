import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS, STATUS_COLORS,
  formatCurrency, formatDate, cn,
} from "@/lib/utils";
import type { Task, TaskCategory } from "@/types";

interface SearchParams {
  category?: string;
  search?: string;
  remote?: string;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(`
      *,
      client:profiles!tasks_client_id_fkey(id, display_name, avatar_url)
    `)
    .eq("status", "open")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }
  if (params.remote === "true") {
    query = query.eq("is_remote", true);
  }

  const { data: tasks = [] } = await query.limit(50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Открытые задачи</h1>
          <p className="text-gray-500 mt-1">{tasks.length} задач доступно</p>
        </div>
        <Link href="/tasks/new" className="btn-primary">
          + Создать задачу
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/tasks"
          className={cn(
            "badge px-3 py-1.5 rounded-full border transition-colors",
            !params.category
              ? "bg-crimson-700 text-white border-crimson-700"
              : "bg-white text-gray-600 border-gray-200 hover:border-crimson-300"
          )}
        >
          Все
        </Link>
        {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((cat) => (
          <Link
            key={cat}
            href={`/tasks?category=${cat}`}
            className={cn(
              "badge px-3 py-1.5 rounded-full border transition-colors",
              params.category === cat
                ? "bg-crimson-700 text-white border-crimson-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-crimson-300"
            )}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚔️</div>
          <h3 className="font-serif text-xl text-gray-700 mb-2">Задач пока нет</h3>
          <p className="text-gray-500">Станьте первым — создайте задачу для рыцарей!</p>
          <Link href="/tasks/new" className="btn-primary inline-block mt-6">
            Создать задачу
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {(tasks as Task[]).map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="card hover:shadow-md hover:border-crimson-200 transition-all block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="badge bg-gray-100 text-gray-600 px-2 py-0.5">
                      {CATEGORY_ICONS[task.category]} {CATEGORY_LABELS[task.category]}
                    </span>
                    <span className={cn("badge px-2 py-0.5", STATUS_COLORS[task.status])}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    {task.is_remote && (
                      <span className="badge bg-blue-50 text-blue-700 px-2 py-0.5">
                        🌐 Удалённо
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{task.title}</h3>
                  {task.location_name && (
                    <p className="text-gray-500 text-sm mt-1">📍 {task.location_name}</p>
                  )}
                  {task.deadline && (
                    <p className="text-gray-500 text-sm mt-1">📅 До {formatDate(task.deadline)}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {task.budget ? (
                    <div className="text-xl font-bold text-crimson-700">
                      {formatCurrency(task.budget, task.currency)}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Бюджет не указан</div>
                  )}
                  <div className="text-gray-400 text-xs mt-1">
                    {formatDate(task.created_at)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
