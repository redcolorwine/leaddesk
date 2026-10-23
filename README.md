# LeadDesk — Lead Management Dashboard

A lightweight lead management dashboard built with React, Vite, n8n, and PostgreSQL. LeadDesk helps users organize leads, manage deal statuses, and track potential revenue through a clean, minimalist interface.

**Live Demo:** https://leaddesk-ashy.vercel.app

## Features

- View and search leads
- Filter leads by status
- Create, edit, and delete leads
- Update lead statuses
- Track deal amounts and potential revenue
- Validate input data on the API
- Handle invalid requests and missing records
- Persist lead data in PostgreSQL

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend and Database**
- n8n — API workflows and request processing
- PostgreSQL — persistent data storage
- Docker — containerized backend services

**Deployment**
- Vercel — frontend hosting
- Cloudflare Tunnel — secure HTTPS access to the self-hosted n8n instance

## Architecture

```text
React + Vite (Vercel)
        |
        | HTTPS / JSON
        v
n8n API Workflows
        |
        | SQL queries
        v
PostgreSQL (Docker)
```

The frontend communicates with n8n through HTTP endpoints. n8n validates incoming data, executes database operations, and returns JSON responses to the frontend.

## API Operations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/webhook/leaddesk/leads` | Retrieve leads |
| POST | `/webhook/leaddesk/leads` | Create a lead |
| PATCH | `/webhook/leaddesk/leads/edit` | Edit lead details |
| PATCH | `/webhook/leaddesk/leads/status` | Update lead status |
| DELETE | `/webhook/leaddesk/leads/delete` | Delete a lead |

Supported lead statuses: `new`, `progress`, `won`, and `lost`.

## Run Locally

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd LeadDesk
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the URL of your GitHub repository.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

Configure the frontend to use your n8n API base URL. Keep environment-specific settings in a Vite environment variable, such as `VITE_API_BASE_URL`, if supported by the project.

For the deployed demo, the API base URL is:

```text
https://n8n.********.ru/webhook/leaddesk/leads
```

### 4. Start the development server

```bash
npm run dev
```

## Security Notes

- API input validation is implemented for lead creation and status updates.
- CORS is configured to allow requests from the deployed frontend.
- CORS is not authentication. The demo API does not yet implement full user authentication or authorization and should not be used with sensitive production data.

## Future Improvements

- Add authentication and role-based access control
- Add pagination and sorting
- Improve automated API testing
- Add dashboards with conversion and revenue statistics
- Add environment-based configuration for development and production

## Project Status

The core lead management workflow is implemented and manually tested, including create, read, update, status change, and delete operations.

Built as a portfolio project to demonstrate frontend development, API integration, workflow automation, and relational database operations.