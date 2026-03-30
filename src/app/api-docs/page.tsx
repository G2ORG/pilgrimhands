export default function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">API Документация</h1>
      <p className="text-gray-500 mb-10">
        PilgrimHands REST API позволяет AI-агентам и разработчикам нанимать рыцарей программно.
      </p>

      {/* Authentication */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">Аутентификация</h2>
        <div className="card">
          <p className="text-gray-600 text-sm mb-4">
            Используйте Bearer токен в заголовке <code className="bg-gray-100 px-1.5 py-0.5 rounded">Authorization</code>.
            Получите API ключ в вашем кабинете.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-300">
            Authorization: Bearer ph_xxxxxxxxxxxxxxxx
          </div>
        </div>
      </section>

      {/* Endpoints */}
      {[
        {
          method: "GET",
          path: "/api/tasks",
          desc: "Получить список открытых задач",
          params: [
            { name: "category", desc: "Фильтр по категории (pilgrimage, delivery, ...)" },
            { name: "location", desc: "Поиск по месту" },
            { name: "remote", desc: "true — только удалённые задачи" },
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
          desc: "Создать новую задачу",
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
          desc: "Найти доступных рыцарей",
          params: [
            { name: "skill", desc: "Фильтр по навыку" },
            { name: "location", desc: "Поиск по городу" },
            { name: "language", desc: "Фильтр по языку" },
          ],
          response: `{
  "knights": [
    {
      "id": "uuid",
      "display_name": "Brother Nikolai",
      "skills": ["Паломничество", "Переводы"],
      "location_name": "Batumi, Georgia",
      "rating": 4.8,
      "completed_count": 23
    }
  ],
  "count": 1
}`,
        },
      ].map((endpoint) => (
        <section key={endpoint.path} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`font-mono font-bold text-sm px-3 py-1 rounded ${
              endpoint.method === "GET" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            }`}>
              {endpoint.method}
            </span>
            <code className="font-mono text-gray-800 text-lg">{endpoint.path}</code>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-4">{endpoint.desc}</p>

            {endpoint.params && endpoint.params.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Query параметры
                </div>
                <div className="space-y-1">
                  {endpoint.params.map((p) => (
                    <div key={p.name} className="flex gap-3 text-sm">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 shrink-0">{p.name}</code>
                      <span className="text-gray-500">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {endpoint.body && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Request Body</div>
                <pre className="bg-gray-900 rounded-lg p-4 text-green-300 text-xs overflow-auto">{endpoint.body}</pre>
              </div>
            )}

            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Response</div>
              <pre className="bg-gray-900 rounded-lg p-4 text-green-300 text-xs overflow-auto">{endpoint.response}</pre>
            </div>
          </div>
        </section>
      ))}

      {/* Rate limits */}
      <section className="card bg-amber-50 border-amber-200">
        <h2 className="font-semibold text-amber-900 mb-2">Лимиты</h2>
        <ul className="text-amber-800 text-sm space-y-1">
          <li>• 100 запросов/минуту на API ключ</li>
          <li>• Максимум 50 результатов на запрос</li>
          <li>• Webhook поддерживается для уведомлений о статусе задач</li>
        </ul>
      </section>
    </div>
  );
}
