'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { analyticsAPI, subjectAPI, lessonAPI, quizAPI } from '@/lib/api';
import { Users, BookOpen, Trophy, TrendingUp, Plus, Save } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function TeacherPanelPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjectForm, setSubjectForm] = useState({ title: '', description: '', icon: '📚', color: '#6366f1' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', content: '', subject: '', difficulty: 'beginner', duration: 10, xpReward: 50 });
  const [quizForm, setQuizForm] = useState({ title: '', subject: '', passingScore: 70, timeLimit: 600, questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10 }] });
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, subjectsRes] = await Promise.all([
        analyticsAPI.getTeacherAnalytics(),
        subjectAPI.getAll()
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setSubjects(subjectsRes.data.subjects || []);
    } catch {
      toast.error('Failed to load teacher analytics');
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    try {
      await subjectAPI.create(subjectForm);
      toast.success('Subject created successfully!');
      setSubjectForm({ title: '', description: '', icon: '📚', color: '#6366f1' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create subject');
    }
  };

  const createLesson = async () => {
    try {
      const formData = new FormData();
      Object.entries(lessonForm).forEach(([k, v]) => formData.append(k, String(v)));
      await lessonAPI.create(formData);
      toast.success('Lesson created successfully!');
      setLessonForm({ title: '', description: '', content: '', subject: '', difficulty: 'beginner', duration: 10, xpReward: 50 });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create lesson');
    }
  };

  const createQuiz = async () => {
    try {
      await quizAPI.create({ ...quizForm, isPublished: true, maxAttempts: 3, xpReward: 100 });
      toast.success('Quiz created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create quiz');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!analytics) return <div>No data</div>;

  const monthlyData = {
    labels: analytics.monthlyActivity.map((m: any) => `${m._id.month}/${m._id.year}`),
    datasets: [
      {
        label: 'Quiz Attempts',
        data: analytics.monthlyActivity.map((m: any) => m.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.3)'
      }
    ]
  };

  const hardestData = {
    labels: analytics.hardestQuizzes.map((q: any) => q.quiz.title),
    datasets: [
      {
        label: 'Average Score %',
        data: analytics.hardestQuizzes.map((q: any) => Math.round(q.avgScore)),
        backgroundColor: '#ef4444'
      }
    ]
  };

  return (
    <ProtectedRoute roles={['teacher', 'admin']}>
      <div className="min-h-screen">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Teacher & Admin Panel</h1>
            <p className="text-[var(--muted-foreground)] mt-1">Manage content and monitor student progress</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Students" value={analytics.overview.totalStudents} icon={Users} />
            <StatsCard title="Published Lessons" value={analytics.overview.totalLessons} icon={BookOpen} />
            <StatsCard title="Quiz Attempts" value={analytics.overview.totalQuizResults} icon={Trophy} />
            <StatsCard title="Avg Quiz Score" value={`${analytics.overview.avgScore}%`} icon={TrendingUp} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Monthly Learning Activity</h3>
              <Line data={monthlyData} options={{ responsive: true }} />
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Most Difficult Quizzes</h3>
              <Bar data={hardestData} options={{ responsive: true }} />
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Create Subject</h3>
              <div className="space-y-3">
                <input value={subjectForm.title} onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })} placeholder="Subject title" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                <textarea value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" rows={3} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={subjectForm.icon} onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })} placeholder="Icon" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                  <input value={subjectForm.color} onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })} placeholder="Color" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                </div>
                <button onClick={createSubject} className="w-full px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2">
                  <Save size={16} /> Save Subject
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Create Lesson</h3>
              <div className="space-y-3">
                <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                <textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" rows={2} />
                <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="Lesson content" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" rows={4} />
                <select value={lessonForm.subject} onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <option value="">Select Subject</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
                <button onClick={createLesson} className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white">Publish Lesson</button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Create Quiz</h3>
              <div className="space-y-3">
                <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Quiz title" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                <select value={quizForm.subject} onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <option value="">Select Subject</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
                <input value={quizForm.questions[0].question} onChange={(e) => setQuizForm({ ...quizForm, questions: [{ ...quizForm.questions[0], question: e.target.value }] })} placeholder="Question" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                {quizForm.questions[0].options.map((op, idx) => (
                  <input key={idx} value={op} onChange={(e) => {
                    const options = [...quizForm.questions[0].options];
                    options[idx] = e.target.value;
                    setQuizForm({ ...quizForm, questions: [{ ...quizForm.questions[0], options }] });
                  }} placeholder={`Option ${idx + 1}`} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
                ))}
                <button onClick={createQuiz} className="w-full px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">Publish Quiz</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
