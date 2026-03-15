'use client';
import { useEffect, useState } from 'react';
import { analyticsAPI, quizAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import NotificationBell from '@/components/NotificationBell';
import { BookOpen, Brain, Trophy, Flame, TrendingUp } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
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
      setData(dashboardRes.data.dashboard);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>No data</div>;

  const progressData = {
    labels: data.weeklyProgress.map((item: any) => new Date(item.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Quiz Score %',
        data: data.weeklyProgress.map((item: any) => item.percentage),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4
      }
    ]
  };

  const quizPassData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [data.stats.passedQuizzes, Math.max(0, data.stats.totalQuizzes - data.stats.passedQuizzes)],
        backgroundColor: ['#10b981', '#ef4444']
      }
    ]
  };

  return (
    <ProtectedRoute roles={['student', 'teacher', 'admin']}>
      <div className="min-h-screen">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">Student Dashboard</h1>
              <p className="text-[var(--muted-foreground)] mt-1">Track your learning progress and achievements</p>
            </div>
            <NotificationBell />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard title="Lessons Completed" value={data.stats.lessonsCompleted} icon={BookOpen} />
            <StatsCard title="Quizzes Taken" value={data.stats.totalQuizzes} icon={Trophy} />
            <StatsCard title="Average Score" value={`${data.stats.avgScore}%`} icon={TrendingUp} />
            <StatsCard title="Learning Streak" value={`${data.stats.streak} days`} icon={Flame} />
            <StatsCard title="Total XP" value={data.stats.xp} icon={Brain} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Weekly Progress</h3>
              <Line data={progressData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Quiz Pass Rate</h3>
              <Doughnut data={quizPassData} options={{ responsive: true }} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Recent Quiz Results</h3>
              <div className="space-y-3">
                {data.recentResults.length === 0 ? (
                  <p className="text-[var(--muted-foreground)] text-sm">No quiz results yet</p>
                ) : (
                  data.recentResults.map((result: any) => (
                    <div key={result._id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{result.quiz?.title || 'Quiz'}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{new Date(result.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${result.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {result.percentage}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Top Learners</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((user, idx) => (
                  <div key={user._id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">#{idx + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Level {user.level}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-indigo-400">{user.xp} XP</span>
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
