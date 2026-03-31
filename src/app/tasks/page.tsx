export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS, STATUS_CSS,
  formatCurrency, formatDate, cn,
} from "@/lib/utils";
import type { Task, TaskCategory } from "@/types";
import { T } from "@/components/T";

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

  if (params.category) query = query.eq("category", params.category);
  if (params.search) query = query.ilike("title", `%${params.search}%`);
  if (params.remote === "true") query = query.eq("is_remote", true);

  const { data: tasksData } = await query.limit(50);
  const tasks: Task[] = (tasksData as Task[]) ?? [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', color: '#c9952a', marginBottom: '0.25rem' }}>
            <T k="openTasks" f="Open Tasks" />
          </h1>
          <p style={{ color: '#7a6a50', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem' }}>
            {tasks.length} <T k="tasksAvailable" f="tasks available" />
          </p>
        </div>
        <Link href="/tasks/new" className="btn-primary">
          <T k="postTask" f="+ Post a Task" />
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        <Link
          href="/tasks"
          style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.35rem 0.85rem',
            fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem',
            border: `1px solid ${!params.category ? '#c9952a' : '#3a2f1a'}`,
            background: !params.category ? 'rgba(201,149,42,0.15)' : 'transparent',
            color: !params.category ? '#c9952a' : '#7a6a50',
            textDecoration: 'none',
          }}
        >
          All
        </Link>
        {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((cat) => (
          <Link
            key={cat}
            href={`/tasks?category=${cat}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '0.35rem 0.85rem',
              fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem',
              border: `1px solid ${params.category === cat ? '#c9952a' : '#3a2f1a'}`,
              background: params.category === cat ? 'rgba(201,149,42,0.15)' : 'transparent',
              color: params.category === cat ? '#c9952a' : '#7a6a50',
              textDecoration: 'none',
            }}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', marginBottom: '0.5rem' }}><T k="noTasks" f="No tasks yet" /></h3>
          <p style={{ color: '#7a6a50', fontStyle: 'italic' }}><T k="noTasksBe" f="Be the first — post a task for the knights!" /></p>
          <Link href="/tasks/new" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
            <T k="postTask" f="Post a Task" />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'rgba(201,149,42,0.1)', color: '#c9952a', border: '1px solid #3a2f1a', padding: '2px 8px' }}>
                        {CATEGORY_ICONS[task.category]} {CATEGORY_LABELS[task.category]}
                      </span>
                      <span className={cn("badge", STATUS_CSS[task.status])} style={{ padding: '2px 8px' }}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      {task.is_remote && (
                        <span className="badge" style={{ background: 'rgba(42,184,204,0.1)', color: '#2ab8cc', border: '1px solid #0d3a42', padding: '2px 8px' }}>
                          🌐 Remote
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontFamily: "'Cinzel', serif", color: '#c0a880', fontSize: '1rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </h3>
                    {task.location_name && (
                      <p style={{ color: '#7a6a50', fontSize: '0.85rem', marginTop: '0.25rem' }}>📍 {task.location_name}</p>
                    )}
                    {task.deadline && (
                      <p style={{ color: '#7a6a50', fontSize: '0.85rem', marginTop: '0.25rem' }}>📅 Until {formatDate(task.deadline)}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {task.budget ? (
                      <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.2rem', color: '#c9952a', fontWeight: 700 }}>
                        {formatCurrency(task.budget, task.currency)}
                      </div>
                    ) : (
                      <div style={{ color: '#7a6a50', fontSize: '0.85rem' }}>No budget set</div>
                    )}
                    <div style={{ color: '#7a5c1a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: "'Share Tech Mono', monospace" }}>
                      {formatDate(task.created_at)}
                    </div>
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
