
-- 1. Create Study Sessions Table
create table public.study_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  date date not null default CURRENT_DATE,
  minutes integer not null default 0,
  created_at timestamp with time zone null default n_now(),
  constraint study_sessions_pkey primary key (id)
);

-- 2. Create Documents Table
create table public.documents (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  author text null,
  category text null,
  upload_date text null,
  content text null,
  cover_url text null,
  file_url text null,
  user_id uuid not null default auth.uid (),
  is_public boolean null default false,
  constraint documents_pkey primary key (id)
);

-- 3. Create Tasks Table
create table public.tasks (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  date text null,
  time text null,
  completed boolean null default false,
  priority text null,
  user_id uuid null default auth.uid (),
  duration integer null default 30,
  constraint tasks_pkey primary key (id)
);

-- 4. Set up Row Level Security (RLS) policies

-- Enable RLS
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;

-- Policies for Documents
create policy "Users can read own docs"
  on public.documents for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own docs"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own docs"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own docs"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Policies for Tasks
create policy "Users can all own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

-- Policies for Study Sessions
create policy "Users can all own study sessions"
  on public.study_sessions for all
  using (auth.uid() = user_id);
