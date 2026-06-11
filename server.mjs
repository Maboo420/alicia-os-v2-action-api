import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const port = Number(process.env.PORT || 3000);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY.');
  process.exit(1);
}

const app = express();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.json({ limit: '1mb' }));

function cleanObject(input, allowedKeys) {
  const output = {};

  for (const key of allowedKeys) {
    if (input[key] !== undefined) {
      output[key] = input[key];
    }
  }

  return output;
}

function normalizeAppointment(input) {
  const values = cleanObject(input, [
    'title',
    'appointment_date',
    'appointment_time',
    'status',
    'location',
    'notes',
    'archived'
  ]);

  if (input.date !== undefined && values.appointment_date === undefined) {
    values.appointment_date = input.date;
  }

  if (input.time !== undefined && values.appointment_time === undefined) {
    values.appointment_time = input.time;
  }

  return values;
}

async function sendQuery(res, query) {
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json({ data });
}

app.get('/dashboard', async (_req, res) => {
  await sendQuery(
    res,
    supabase
      .from('dashboard_current')
      .select('*')
      .order('target_date', { ascending: true, nullsFirst: false })
      .limit(50)
  );
});

app.get('/appointments/upcoming', async (_req, res) => {
  await sendQuery(
    res,
    supabase
      .from('upcoming_appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .limit(50)
  );
});

app.get('/memories/active', async (_req, res) => {
  await sendQuery(
    res,
    supabase
      .from('memories')
      .select('*')
      .eq('archived', false)
      .order('updated_at', { ascending: false })
      .limit(50)
  );
});

app.get('/projects/active', async (_req, res) => {
  await sendQuery(
    res,
    supabase
      .from('active_projects')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)
  );
});

app.get('/tasks/open', async (_req, res) => {
  await sendQuery(
    res,
    supabase
      .from('open_tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(50)
  );
});

app.post('/memory', async (req, res) => {
  const values = cleanObject(req.body, [
    'title',
    'content',
    'category',
    'priority',
    'status',
    'source'
  ]);

  if (!values.title) {
    return res.status(400).json({ error: 'title is required' });
  }

  await sendQuery(
    res,
    supabase.from('memories').insert(values).select('*').single()
  );
});

app.patch('/memory/:id', async (req, res) => {
  const values = cleanObject(req.body, [
    'title',
    'content',
    'category',
    'priority',
    'status',
    'source',
    'archived'
  ]);

  await sendQuery(
    res,
    supabase.from('memories').update(values).eq('id', req.params.id).select('*').single()
  );
});

app.delete('/memory/:id', async (req, res) => {
  await sendQuery(
    res,
    supabase.from('memories').delete().eq('id', req.params.id).select('id').single()
  );
});

app.post('/appointment', async (req, res) => {
  const values = normalizeAppointment(req.body);

  if (!values.title) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (!values.appointment_date) {
    return res.status(400).json({ error: 'date or appointment_date is required' });
  }

  await sendQuery(
    res,
    supabase.from('appointments').insert(values).select('*').single()
  );
});

app.patch('/appointment/:id', async (req, res) => {
  const values = normalizeAppointment(req.body);

  await sendQuery(
    res,
    supabase.from('appointments').update(values).eq('id', req.params.id).select('*').single()
  );
});

app.delete('/appointment/:id', async (req, res) => {
  await sendQuery(
    res,
    supabase.from('appointments').delete().eq('id', req.params.id).select('id').single()
  );
});

app.post('/task', async (req, res) => {
  const values = cleanObject(req.body, [
    'title',
    'status',
    'priority',
    'due_date',
    'project_id',
    'notes'
  ]);

  if (!values.title) {
    return res.status(400).json({ error: 'title is required' });
  }

  await sendQuery(
    res,
    supabase.from('tasks').insert(values).select('*').single()
  );
});

app.patch('/task/:id', async (req, res) => {
  const values = cleanObject(req.body, [
    'title',
    'status',
    'priority',
    'due_date',
    'project_id',
    'notes',
    'archived'
  ]);

  await sendQuery(
    res,
    supabase.from('tasks').update(values).eq('id', req.params.id).select('*').single()
  );
});

app.delete('/task/:id', async (req, res) => {
  await sendQuery(
    res,
    supabase.from('tasks').delete().eq('id', req.params.id).select('id').single()
  );
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Alicia OS Action API listening on port ${port}`);
});
