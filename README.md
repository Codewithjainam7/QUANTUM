# Quantum - AI Career CoPilot

![Quantum Banner](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge) ![Tech](https://img.shields.io/badge/Built%20With-Gemini%202.5%20%7C%20React%20%7C%20Supabase-blue?style=for-the-badge)

**Quantum** is a voice-first career navigation system designed to act as an "Operating System for Career Growth." It combines real-time labor market data with generative AI to help users plan skill paths, benchmark salaries, simulate interviews, and analyze course ROI.

## 🚀 Key Features

### 🧠 For Candidates
*   **Neural Voice Core**: Real-time, low-latency voice interview simulations using **Gemini Live API**.
*   **Career Simulations**: Strategic roadmaps visualizing different career paths and timelines (Timeline & Matrix views).
*   **Course ROI Referee**: AI analysis of course URLs to detect scams, verify providers, and calculate value.
*   **Skill & Salary Benchmarking**: Real-time telemetry on market readiness and income projections.

### 🛡️ For Admins / HR (New)
*   **Bulk Resume Neural Scanner**: Process batches of resumes simultaneously using parallel AI agents.
*   **Multi-Agent Consensus**: 
    *   *Structure Analyst*: Validates experience ranges and role fit.
    *   *Fairness Watchdog*: Detects and flags potential bias (PII, age, gender markers).
    *   *Skill Scout*: Deep semantic matching for custom requirements.
*   **CSV Report Export**: Download detailed adjudication reports for offline compliance reviews.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS, Framer Motion (Animations)
*   **AI**: Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash, Gemini Live
*   **Backend / Auth**: Supabase
*   **Visualization**: Recharts

## ⚙️ Environment Variables (Vercel Setup)

When deploying to Vercel, go to **Settings > Environment Variables** and add the following:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `API_KEY` | Your Google Gemini API Key (obtained from AI Studio) | **Yes** |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | **Yes** |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key | **Yes** |

> **Note**: The application checks for `API_KEY` (standard) and `VITE_GEMINI_API_KEY` (Vite specific) for flexibility.

## 🚀 Deploying to Vercel

1.  **Push to GitHub**: Commit your changes and push this repository to GitHub.
2.  **Import Project**: Go to [Vercel](https://vercel.com/new), import your repository.
3.  **Configure Build**:
    *   Framework Preset: `Vite`
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
4.  **Add Environment Variables**: Copy the keys mentioned above into the Vercel dashboard.
5.  **Deploy**: Click deploy and wait for the build to finish.

## 🗄️ Database Setup (Supabase)

Run the following SQL in your Supabase SQL Editor to set up the schema required for the dashboard and user management:

```sql
-- Profiles Table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  title text,
  target_role text,
  skills text[],
  location text,
  experience_years int,
  onboarding_completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- User Preferences Table
create table user_preferences (
  user_id uuid references auth.users not null primary key,
  interests text[],
  cities text[],
  migration_willingness text,
  salary_target numeric,
  salary_goal_2y numeric,
  risk_tolerance text,
  learning_styles text[],
  language text
);

-- Simulations Table (Seed with initial data if needed)
create table simulations (
  id uuid default gen_random_uuid() primary key,
  role text,
  years_to_goal numeric,
  salary_range_min numeric,
  salary_range_max numeric,
  skill_gap text,
  match_score numeric,
  description text,
  requirements text[],
  salary_growth numeric[]
);

-- User Progress Table
create table user_progress (
  user_id uuid references auth.users not null primary key,
  projected_salary numeric default 0,
  skills_mastered int default 0,
  applications_count int default 0,
  interviews_count int default 0,
  courses_completed int default 0
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

alter table user_preferences enable row level security;
create policy "Users can all on prefs" on user_preferences for all using (auth.uid() = user_id);

alter table simulations enable row level security;
create policy "Public simulations" on simulations for select to authenticated using (true);

alter table user_progress enable row level security;
create policy "Users see own progress" on user_progress for select using (auth.uid() = user_id);
```

## 📦 Local Development

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd quantum
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📄 License

MIT
