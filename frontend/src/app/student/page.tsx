'use client';
import { useEffect, useState } from 'react';
import { analyticsAPI, quizAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import NotificationBell from '@/components/NotificationBell';
import { BookOpen, Brain, Trophy, Flame, TrendingUp, Target, Medal } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import toast from 'react-hot-toast';

type WeeklyProgressItem = {
  createdAt: string;
  percentage: number;
};

type QuizStats = {
  lessonsCompleted: number;
  totalQuizzes: number;
  avgScore: number;
  streak: number;
  xp: number;
  passedQuizzes: number;
};

type RecentResult = {
  _id: string;
  createdAt: string;
  percentage: number;
  passed: boolean;
  quiz?: { title?: string };
};

type StudentDashboardData = {
  weeklyProgress: WeeklyProgressItem[];
  stats: QuizStats;
  recentResults: RecentResult[];
};

type LeaderboardUser = {
  _id: string;
  name: string;
  level: number;
  xp: number;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, leaderboardRes] = await Promise.all([
        analyticsAPI.getStudentDashboard(),
        quizAPI.getGlobalLeaderboard()
      ]);
      setData(dashboardRes.data.dashboard as StudentDashboardData);
      setLeaderboard((leaderboardRes.data.leaderboard || []) as LeaderboardUser[]);
    } catch {
      toast.error('Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="min-h-screen flex items-center justify-center">No data</div>;

  const progressData = {
    labels: data.weeklyProgress.map((item) => new Date(item.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Quiz Score %',
        data: data.weeklyProgress.map((item) => item.percentage),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const quizPassData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [data.stats.passedQuizzes, Math.max(0, data.stats.totalQuizzes - data.stats.passedQuizzes)],
        backgroundColor: ['#10b981', '#f97316']
      }
    ]
  };

  const completionRate = data.stats.totalQuizzes
    ? Math.round((data.stats.passedQuizzes / data.stats.totalQuizzes) * 100)
    : 0;

  return (
    <ProtectedRoute roles={['student', 'teacher', 'admin']}>
      <div className="min-h-screen relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_18%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_86%_0%,rgba(16,185,129,0.22),transparent_30%),linear-gradient(180deg,#f8fcff_0%,#f6fbf7_45%,#f8f7fb_100%)] dark:bg-[radial-gradient(circle_at_15%_18%,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_86%_0%,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#0b1220_0%,#111827_45%,#0e1522_100%)]" />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="mb-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-900 dark:bg-sky-400/20 dark:text-sky-100 px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-3">
                  <Target size={14} /> Personal Learning Hub
                </p>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Student Dashboard</h1>
                <p className="text-[var(--muted-foreground)] mt-2 text-base leading-relaxed">
                  Har bir natijani kuzatib boring, kuchli va kuchsiz mavzularni toping, va darajangizni barqaror oshiring.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Completion rate</p>
                  <p className="text-2xl font-black">{completionRate}%</p>
                </div>
                <NotificationBell />
              </div>
            </div>
          </section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard title="Lessons Completed" value={data.stats.lessonsCompleted} icon={BookOpen} color="text-sky-600" />
            <StatsCard title="Quizzes Taken" value={data.stats.totalQuizzes} icon={Trophy} color="text-orange-600" />
            <StatsCard title="Average Score" value={`${data.stats.avgScore}%`} icon={TrendingUp} color="text-emerald-600" />
            <StatsCard title="Learning Streak" value={`${data.stats.streak} days`} icon={Flame} color="text-rose-600" />
            <StatsCard title="Total XP" value={data.stats.xp} icon={Brain} color="text-violet-600" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h3 className="font-semibold mb-4">Weekly Progress</h3>
              <Line
                data={progressData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, max: 100 }
                  }
                }}
              />
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h3 className="font-semibold mb-4">Quiz Pass Rate</h3>
              <Doughnut
                data={quizPassData}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h3 className="font-semibold mb-4">Recent Quiz Results</h3>
              <div className="space-y-3">
                {data.recentResults.length === 0 ? (
                  <p className="text-[var(--muted-foreground)] text-sm">No quiz results yet</p>
                ) : (
                  data.recentResults.map((result) => (
                    <div key={result._id} className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{result.quiz?.title || 'Quiz'}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{new Date(result.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${result.passed ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                        {result.percentage}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h3 className="font-semibold mb-4">Top Learners</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((user, idx) => (
                  <div key={user._id} className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">#{idx + 1}</span>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1"><Medal size={14} className="text-amber-500" /> {user.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Level {user.level}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">{user.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
