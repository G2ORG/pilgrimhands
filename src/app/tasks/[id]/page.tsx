export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS, STATUS_CSS,
  formatCurrency, formatDate, cn,
} from "@/lib/utils";
import type { Task, Offer } from "@/types";
import { OfferForm } from "./OfferForm";
import { AcceptOffer } from "./AcceptOffer";
import { PayPalPayment } from "@/components/PayPalPayment";
import { T } from "@/components/T";

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
  const hasOffer = user ? task.offers?.some((o: Offer) => o.knight_id === user.id) : false;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/tasks" style={{ color: '#7a5c1a', textDecoration: 'none', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.8rem' }}>
          <T k="allTasks" f="← All Tasks" />
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }} className="md:grid-cols-3">
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="md:col-span-2">
          <div className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge" style={{ background: 'rgba(201,149,42,0.1)', color: '#c9952a', border: '1px solid #3a2f1a', padding: '2px 8px' }}>
                {CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]}{" "}
                {CATEGORY_LABELS[task.category as keyof typeof CATEGORY_LABELS]}
              </span>
              <span className={cn("badge", STATUS_CSS[task.status as keyof typeof STATUS_CSS])} style={{ padding: '2px 8px' }}>
                {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
              </span>
              {task.is_remote && (
                <span className="badge" style={{ background: 'rgba(42,184,204,0.1)', color: '#2ab8cc', border: '1px solid #0d3a42', padding: '2px 8px' }}>
                  🌐 <T k="remote" f="Remote" />
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: '#c9952a', marginBottom: '1rem' }}>
              {task.title}
            </h1>

            {task.description && (
              <div style={{ color: '#d4b896', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                {task.description}
              </div>
            )}
          </div>

          {/* Offers */}
          {(isClient || isKnight) && task.offers && task.offers.length > 0 && (
            <div className="card">
              <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1rem', marginBottom: '1rem' }}>
                <T k="offersLabel" f="Offers" /> ({task.offers.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(task.offers as Offer[]).map((offer) => (
                  <div
                    key={offer.id}
                    style={{ border: '1px solid #3a2f1a', padding: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px', height: '40px', flexShrink: 0,
                        background: 'rgba(201,149,42,0.15)', border: '1px solid #7a5c1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontWeight: 700,
                      }}>
                        {offer.knight?.display_name?.[0] ?? "?"}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cinzel', serif", color: '#c0a880', fontSize: '0.9rem' }}>
                          {offer.knight?.display_name}
                        </div>
                        {offer.message && (
                          <p style={{ color: '#7a6a50', fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>{offer.message}</p>
                        )}
                        {offer.eta_hours && (
                          <p style={{ color: '#7a5c1a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: "'Share Tech Mono', monospace" }}>
                            ⏱ {offer.eta_hours} hrs
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontSize: '1.1rem', fontWeight: 700 }}>
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
              <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1rem', marginBottom: '1rem' }}>
                <T k="submitOffer" f="Submit an Offer" />
              </h2>
              <OfferForm taskId={task.id} currency={task.currency} />
            </div>
          )}

          {!user && task.status === "open" && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#d4b896', fontStyle: 'italic', marginBottom: '1rem' }}>
                <T k="signInOffer" f="Sign in to submit an offer for this task" />
              </p>
              <Link href={`/auth?redirectTo=/tasks/${task.id}`} className="btn-primary" style={{ display: 'inline-block' }}>
                <T k="signInBtn" f="Sign In / Register" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="section-title"><T k="taskDetails" f="Task Details" /></div>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              {task.budget && (
                <div>
                  <dt style={{ color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', textTransform: 'uppercase' }}><T k="budget" f="Budget" /></dt>
                  <dd style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem', color: '#c9952a', fontWeight: 700 }}>
                    {formatCurrency(task.budget, task.currency)}
                  </dd>
                </div>
              )}
              {task.location_name && (
                <div>
                  <dt style={{ color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', textTransform: 'uppercase' }}><T k="location" f="Location" /></dt>
                  <dd style={{ color: '#c0a880' }}>📍 {task.location_name}</dd>
                </div>
              )}
              {task.deadline && (
                <div>
                  <dt style={{ color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', textTransform: 'uppercase' }}><T k="deadline" f="Deadline" /></dt>
                  <dd style={{ color: '#c0a880' }}>📅 {formatDate(task.deadline)}</dd>
                </div>
              )}
              <div>
                <dt style={{ color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem', textTransform: 'uppercase' }}><T k="posted" f="Posted" /></dt>
                <dd style={{ color: '#c0a880' }}>{formatDate(task.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* PayPal payment — shown to client when task is assigned */}
          {isClient && task.status === "assigned" && task.budget && (
            <div className="card">
              <div className="section-title"><T k="fundTask" f="Fund Task" /></div>
              <p style={{ color: '#7a6a50', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                <T k="fundEscrow" f="Pay to lock the budget in escrow. Released to the knight upon completion." />
              </p>
              <PayPalPayment
                taskId={task.id}
                amount={task.budget}
                currency={task.currency ?? "USD"}
              />
            </div>
          )}

          <div className="card">
            <div className="section-title"><T k="clientLabel" f="Client" /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'rgba(201,149,42,0.15)', border: '1px solid #7a5c1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontWeight: 700,
              }}>
                {task.client?.display_name?.[0] ?? "?"}
              </div>
              <div style={{ fontFamily: "'Cinzel', serif", color: '#c0a880', fontSize: '0.9rem' }}>
                {task.client?.display_name ?? <T k="anon" f="Anonymous" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
