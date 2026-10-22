
import { useState, useEffect } from 'react'
import './App.css'

const initialLeads = [
  { id: 1, name: 'Анна Смирнова', email: 'anna@mail.ru', service: 'Разработка сайта', amount: 45000, status: 'new' },
  { id: 2, name: 'Иван Петров', email: 'ivan@mail.ru', service: 'Настройка CRM', amount: 25000, status: 'progress' },
  { id: 3, name: 'Мария Козлова', email: 'maria@mail.ru', service: 'Автоматизация', amount: 60000, status: 'won' },
  { id: 4, name: 'Дмитрий Волков', email: 'd.volkov@mail.ru', service: 'Чат-бот', amount: 18000, status: 'new' },
]

const statusLabels = {
  new: 'Новая',
  progress: 'В работе',
  won: 'Успешно',
  lost: 'Потеряна',
}

const formatMoney = (amount) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)

function App() {

  const [editingId, setEditingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [leads, setLeads] = useState([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch(
          'https://n8n.serhiotester97.ru/webhook/leaddesk/leads'
        )

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`)
        }

        const result = await response.json()

        if (result.success !== true || !Array.isArray(result.leads)) {
          throw new Error('Сервер вернул некорректный список заявок.')
        }

        const loadedLeads = result.leads.map((lead) => ({
          ...lead,
          id: Number(lead.id),
          amount: Number(lead.amount),
        }))

        setLeads(loadedLeads)
      } catch (error) {
        console.error('Не удалось загрузить заявки:', error)
        alert('Не удалось загрузить заявки с сервера.')
      } finally {
        setIsLoadingLeads(false)
      }
    }

    loadLeads()
  }, [])
  const filteredLeads = leads.filter((lead) => {
    const query = search.toLowerCase().trim()

    const matchesSearch =
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.service.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const totalLeads = leads.length

  const newLeads = leads.filter((lead) => lead.status === 'new').length

  const inProgressLeads = leads.filter(
    (lead) => lead.status === 'progress'
  ).length

  const wonLeads = leads.filter((lead) => lead.status === 'won').length

  const totalRevenue = leads
    .filter((lead) => lead.status === 'won')
    .reduce((sum, lead) => sum + lead.amount, 0)

  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    service: '',
    amount: '',
  })


  async function handleAddLead(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.service.trim()) {
      alert('Заполни все обязательные поля.')
      return
    }

    if (
      form.amount === '' ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) < 0
    ) {
      alert('Укажи корректную сумму.')
      return
    }

    const newLead = {
      name: form.name.trim(),
      email: form.email.trim(),
      service: form.service.trim(),
      amount: Number(form.amount),
    }

    try {
      const response = await fetch('https://n8n.serhiotester97.ru/webhook/leaddesk/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      })

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`)
      }

      const result = await response.json()

      if (result.success !== true) {
        throw new Error('Сервер не подтвердил создание заявки.')
      }

      setLeads((prev) => [
        {
          ...result.lead,
          id: Number(result.lead.id),
          amount: Number(result.lead.amount),
        },
        ...prev,
      ])

      setForm({
        name: '',
        email: '',
        service: '',
        amount: '',
      })

      setShowForm(false)
      setSearch('')
      setStatusFilter('all')
    } catch (error) {
      console.error('Не удалось создать заявку:', error)
      alert(
        'Не удалось сохранить заявку на сервере. Проверь подключение и попробуй ещё раз.'
      )
    }
  }

  async function handleStatusChange(leadId, newStatus) {
    try {
      const response = await fetch(
        'https://n8n.serhiotester97.ru/webhook/leaddesk/leads/status',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: leadId,
            status: newStatus,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`)
      }

      const result = await response.json()

      if (result.success !== true || !result.lead) {
        throw new Error('Сервер не подтвердил изменение статуса.')
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === Number(result.lead.id)
            ? { ...lead, status: result.lead.status }
            : lead
        )
      )
    } catch (error) {
      console.error('Не удалось обновить статус:', error)
      alert('Не удалось сохранить статус на сервере.')
    }
  }


  async function handleUpdateLead(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.service.trim()) {
      alert('Заполни все обязательные поля.')
      return
    }

    if (
      form.amount === '' ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) < 0
    ) {
      alert('Укажи корректную сумму.')
      return
    }

    try {
      const response = await fetch(
        'https://n8n.serhiotester97.ru/webhook/leaddesk/leads/edit',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            name: form.name.trim(),
            email: form.email.trim(),
            service: form.service.trim(),
            amount: Number(form.amount),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`)
      }

      const result = await response.json()

      if (result.success !== true || !result.lead) {
        throw new Error('Сервер не подтвердил изменение заявки.')
      }

      const updatedLead = {
        ...result.lead,
        id: Number(result.lead.id),
        amount: Number(result.lead.amount),
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      )

      setEditingId(null)
      setShowForm(false)
      setForm({ name: '', email: '', service: '', amount: '' })
    } catch (error) {
      console.error('Не удалось обновить заявку:', error)
      alert('Не удалось сохранить изменения на сервере.')
    }
  }

  async function handleDeleteLead(leadId) {
    const confirmed = window.confirm(
      'Ты действительно хочешь удалить эту заявку? Это действие нельзя отменить.'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        'https://n8n.serhiotester97.ru/webhook/leaddesk/leads/delete',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: leadId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`)
      }

      const result = await response.json()

      if (result.success !== true || !result.deleted) {
        throw new Error(result.message || 'Не удалось удалить заявку.')
      }

      setLeads((prev) =>
        prev.filter((lead) => lead.id !== Number(leadId))
      )
    } catch (error) {
      console.error('Не удалось удалить заявку:', error)
      alert('Не удалось удалить заявку на сервере.')
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">Lead<span>Desk</span></h2>

        <nav>
          <button className="nav-item active">▦ Обзор</button>
          <button className="nav-item">♧ Заявки</button>
          <button className="nav-item">⚙ Настройки</button>
        </nav>

        <div className="sidebar-bottom">LeadDesk · MVP</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Обзор</h1>
            <p>Управляйте заявками и отслеживайте продажи.</p>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setEditingId(null)
              setForm({ name: '', email: '', service: '', amount: '' })
              setShowForm((prev) => !prev)
            }}
          >
            + Добавить заявку
          </button>
        </header>

        {showForm && (
          <form
            className="lead-form"
            onSubmit={editingId ? handleUpdateLead : handleAddLead}
          >
            <h2>{editingId ? 'Редактировать заявку' : 'Новая заявка'}</h2>

            <input
              placeholder="Имя клиента"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              placeholder="Услуга"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              required
            />

            <input
              type="number"
              min="0"
              step="1"
              placeholder="Сумма в рублях"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />

            <div className="form-actions">
              <button className="primary-button" type="submit">
                Сохранить заявку
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>
                Отмена
              </button>
            </div>
          </form>
        )}

        <section className="stats">
          <div className="stat-card">
            <p>Всего заявок</p>
            <h2>{totalLeads}</h2>
            <span>Все клиенты</span>
          </div>
          <div className="stat-card">
            <p>Новые</p>
            <h2>{newLeads}</h2>
            <span>Требуют внимания</span>
          </div>
          <div className="stat-card">
            <p>В работе</p>
            <h2>{inProgressLeads}</h2>
            <span>Активные заявки</span>
          </div>
          <div className="stat-card">
            <p>Успешные сделки</p>
            <h2>{wonLeads}</h2>
            <span>Завершённые продажи</span>
          </div>
          <div className="stat-card">
            <p>Выручка</p>
            <h2>{formatMoney(totalRevenue)}</h2>
            <span>Сумма успешных сделок</span>
          </div>
        </section>

        <section className="leads-section">
          <div className="section-heading">
            <div>
              <h2>Последние заявки</h2>
              <p>Список клиентов и текущий статус</p>
            </div>
            <input
              type="search"
              placeholder="Поиск по имени, email или услуге..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="new">Новые</option>
              <option value="progress">В работе</option>
              <option value="won">Успешные</option>
              <option value="lost">Потерянные</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Услуга</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.name}</strong>
                      <small>{lead.email}</small>
                    </td>
                    <td>{lead.service}</td>
                    <td>{formatMoney(lead.amount)}</td>
                    <td>
                      <select
                        className={`status ${lead.status}`}
                        value={lead.status}
                        onChange={(event) => {
                          handleStatusChange(lead.id, event.target.value)
                        }}
                      >
                        <option value="new">Новая</option>
                        <option value="progress">В работе</option>
                        <option value="won">Успешно</option>
                        <option value="lost">Потеряна</option>
                      </select>
                    </td>
                    <td>

                      <button
                        className="delete-button"
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        Удалить
                      </button>

                      <button
                        className="edit-button"
                        onClick={() => {
                          setEditingId(lead.id)
                          setForm({
                            name: lead.name,
                            email: lead.email,
                            service: lead.service,
                            amount: String(lead.amount),
                          })
                          setShowForm(true)
                        }}
                      >
                        Изменить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
