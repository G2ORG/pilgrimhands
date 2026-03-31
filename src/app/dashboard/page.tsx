export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  STATUS_LABELS, STATUS_CSS, CATEGORY_ICONS, CATEGORY_LABELS,
  formatCurrency, formatDate, cn,
} from "@/lib/utils";
import type { Task } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  const { data: clientTasksData } = await supabase
    .from("tasks")
    .select("*, offers(count)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const clientTasks: Task[] = (clientTasksData as Task[]) ?? [];

  const { data: knightTasksData } = await supabase
    .from("tasks")
    .select("*, client:profiles!tasks_client_id_fkey(id, display_name)")
    .eq("knight_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const knightTasks: Task[] = (knightTasksData as Task[]) ?? [];

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.6rem', color: '#c9952a', marginBottom: '0.25rem' }}>
            Cabinet
          </h1>
          <p style={{ color: '#7a6a50', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem' }}>
            {profile?.display_name ?? user.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/tasks/new" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
            + Task
          </Link>
          <form action={handleSignOut}>
            <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#3a2f1a', marginBottom: '3rem' }}
        className="md:grid-cols-4">
        {[
          { label: "My Tasks", value: clientTasks.length, icon: "📜" },
          { label: "As Knight", value: knightTasks.length, icon: "⚔️" },
          { label: "Role", value: profile?.role ?? "client", icon: "👤" },
          { label: "Status", value: "Active", icon: "✅" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#060402', padding: '1.5rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.4rem', color: '#c9952a' }}>{stat.value}</div>
            <div style={{ color: '#7a6a50', fontSize: '0.75rem', fontFamily: "'Share Tech Mono', monospace", marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Client tasks */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            My Tasks (Client)
          </h2>
          <Link href="/tasks/new" style={{ color: '#c9952a', textDecoration: 'none', fontSize: '0.8rem', fontFamily: "'Share Tech Mono', monospace" }}>
            + New Task
          </Link>
        </div>
        {clientTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#7a6a50', fontStyle: 'italic' }}>You have not created any tasks yet.</p>
            <Link href="/tasks/new" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem' }}>
              Post First Task
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {clientTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span className={cn("badge", STATUS_CSS[task.status])} style={{ padding: '1px 8px', fontSize: '0.7rem' }}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      <span style={{ color: '#7a5c1a', fontSize: '0.75rem', fontFamily: "'Share Tech Mono', monospace" }}>
                        {CATEGORY_ICONS[task.category]} {CATEGORY_LABELS[task.category]}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Cinzel', serif", color: '#c0a880', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    <div style={{ color: '#7a5c1a', fontSize: '0.75rem', fontFamily: "'Share Tech Mono', monospace", marginTop: '2px' }}>
                      {formatDate(task.created_at)}
                    </div>
                  </div>
                  {task.budget && (
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontWeight: 700, flexShrink: 0 }}>
                      {formatCurrency(task.budget, task.currency)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Knight tasks */}
      {knightTasks.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            My Assignments (Knight)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {knightTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ minWidth: 0 }}>
                    <span className={cn("badge", STATUS_CSS[task.status])} style={{ padding: '1px 8px', fontSize: '0.7rem', display: 'inline-block', marginBottom: '0.25rem' }}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <div style={{ fontFamily: "'Cinzel', serif", color: '#c0a880', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                  </div>
                  {task.budget && (
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontWeight: 700, flexShrink: 0 }}>
                      {formatCurrency(task.budget, task.currency)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Knight CTA */}
      {(!profile?.role || profile.role === "client") && (
        <div style={{
          background: 'rgba(201,149,42,0.05)', border: '1px solid #7a5c1a',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚔️</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Become a Knight of the Order
          </h3>
          <p style={{ color: '#7a6a50', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
            Complete tasks for pilgrims and earn while helping people around the world.
          </p>
          <Link href="/knight-onboarding" className="btn-primary" style={{ display: 'inline-block' }}>
            Apply Now
          </Link>
        </div>
      )}
    </div>
  );
}
