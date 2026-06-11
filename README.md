# Alicia OS v2 Action API

Minimal REST API bridge for Alicia OS v2.

It connects a Custom GPT Action to the Alicia OS v2 Supabase database.

## Environment

Set these variables before running:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
PORT
```

Do not put the Supabase `service_role` key in this app.

## Run

```bash
npm install
npm start
```

## Main Endpoints

- `GET /dashboard`
- `GET /appointments/upcoming`
- `GET /memories/active`
- `GET /projects/active`
- `GET /tasks/open`
- `POST /memory`
- `PATCH /memory/:id`
- `DELETE /memory/:id`
- `POST /appointment`
- `PATCH /appointment/:id`
- `DELETE /appointment/:id`
- `POST /task`
- `PATCH /task/:id`
- `DELETE /task/:id`
