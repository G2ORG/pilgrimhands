export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/tasks",
      desc: "Get a list of open tasks",
      params: [
        { name: "category", desc: "Filter by category (pilgrimage, delivery, ...)" },
        { name: "location", desc: "Search by location" },
        { name: "remote", desc: "true — remote tasks only" },
      ],
      response: `{
  "tasks": [
    {
      "id": "uuid",
      "title": "Meet pilgrims at Tbilisi airport",
      "category": "pilgrimage",
      "location_name": "Tbilisi, Georgia",
      "budget": 50,
      "currency": "USD",
      "status": "open"
    }
  ],
  "count": 1
}`,
    },
    {
      method: "POST",
      path: "/api/tasks",
      desc: "Create a new task",
      params: [],
      body: `{
  "title": "Pick up documents from notary",
  "description": "Need to collect 3 notarized documents",
  "category": "documents",
  "location_name": "Batumi, Georgia",
  "budget": 30,
  "currency": "USD",
  "deadline": "2026-04-15T12:00:00Z"
}`,
      response: `{ "task": { "id": "uuid", "status": "open", ... } }`,
    },
    {
      method: "GET",
      path: "/api/knights",
      desc: "Find available knights",
      params: [
        { name: "skill", desc: "Filter by skill" },
        { name: "location", desc: "Search by city" },
        { name: "language", desc: "Filter by language" },
      ],
      response: `{
  "knights": [
    {
      "id": "uuid",
      "display_name": "Brother Nikolai",
      "skills": ["Pilgrimage", "Translation"],
      "location_name": "Batumi, Georgia",
      "rating": 4.8,
      "completed_count": 23
    }
  ],
  "count": 1
}`,
    },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', color: '#c9952a', marginBottom: '0.5rem' }}>
        API Documentation
      </h1>
      <p style={{ color: '#7a6a50', fontStyle: 'italic', marginBottom: '3rem' }}>
        PilgrimHands REST API allows AI agents and developers to hire knights programmatically.
      </p>

      {/* Authentication */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="divider" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Authentication
          </span>
        </div>
        <div className="card">
          <p style={{ color: '#d4b896', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
            Use a Bearer token in the{" "}
            <code style={{ background: 'rgba(201,149,42,0.1)', color: '#c9952a', padding: '2px 6px', fontFamily: "'Share Tech Mono', monospace" }}>Authorization</code>{" "}
            header. Obtain your API key in the Cabinet.
          </p>
          <div style={{ background: '#060402', border: '1px solid #3a2f1a', padding: '1rem 1.25rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem', color: '#c9952a' }}>
            Authorization: Bearer ph_xxxxxxxxxxxxxxxx
          </div>
        </div>
      </section>

      {/* Endpoints */}
      {endpoints.map((endpoint) => (
        <section key={endpoint.path} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontWeight: 700, fontSize: '0.75rem',
              padding: '3px 10px',
              background: endpoint.method === "GET" ? 'rgba(42,184,204,0.1)' : 'rgba(106,184,106,0.1)',
              color: endpoint.method === "GET" ? '#2ab8cc' : '#6ab86a',
              border: `1px solid ${endpoint.method === "GET" ? '#0d3a42' : '#2a5a2a'}`,
            }}>
              {endpoint.method}
            </span>
            <code style={{ fontFamily: "'Share Tech Mono', monospace", color: '#c0a880', fontSize: '1rem' }}>{endpoint.path}</code>
          </div>
          <div className="card">
            <p style={{ color: '#7a6a50', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>{endpoint.desc}</p>

            {endpoint.params && endpoint.params.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="section-title">Query Parameters</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {endpoint.params.map((p) => (
                    <div key={p.name} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <code style={{ background: 'rgba(201,149,42,0.08)', color: '#c9952a', padding: '1px 8px', fontFamily: "'Share Tech Mono', monospace", flexShrink: 0 }}>{p.name}</code>
                      <span style={{ color: '#7a6a50' }}>{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {endpoint.body && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="section-title">Request Body</div>
                <pre style={{ background: '#060402', border: '1px solid #3a2f1a', padding: '1rem', color: '#c9952a', fontSize: '0.8rem', overflow: 'auto', fontFamily: "'Share Tech Mono', monospace" }}>
                  {endpoint.body}
                </pre>
              </div>
            )}

            <div>
              <div className="section-title">Response</div>
              <pre style={{ background: '#060402', border: '1px solid #3a2f1a', padding: '1rem', color: '#c9952a', fontSize: '0.8rem', overflow: 'auto', fontFamily: "'Share Tech Mono', monospace" }}>
                {endpoint.response}
              </pre>
            </div>
          </div>
        </section>
      ))}

      {/* Rate limits */}
      <section className="card" style={{ background: 'rgba(201,149,42,0.05)', borderColor: '#7a5c1a' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Rate Limits
        </h2>
        <ul style={{ color: '#d4b896', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontStyle: 'italic' }}>
          <li>• 100 requests/minute per API key</li>
          <li>• Maximum 50 results per request</li>
          <li>• Webhook support for task status notifications</li>
        </ul>
      </section>
    </div>
  );
}
