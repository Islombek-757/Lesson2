'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { analyticsAPI, subjectAPI, lessonAPI, quizAPI } from '@/lib/api';
import { Users, BookOpen, Trophy, TrendingUp, Plus, Save, Layers3, Sparkles, ClipboardList, CircleCheck } from 'lucide-react';
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

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
};

type SubjectItem = {
  _id: string;
  title: string;
};

type TeacherOverview = {
  totalStudents: number;
  totalLessons: number;
  totalQuizResults: number;
  avgScore: number;
};

type MonthlyActivityItem = {
  _id: { month: number; year: number };
  count: number;
};

type HardestQuizItem = {
  quiz: { title: string };
  avgScore: number;
};

type TeacherAnalytics = {
  overview: TeacherOverview;
  monthlyActivity: MonthlyActivityItem[];
  hardestQuizzes: HardestQuizItem[];
};

const readApiError = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeError = error as { response?: { data?: { error?: string } } };
    return maybeError.response?.data?.error || fallback;
  }
  return fallback;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function TeacherPanelPage() {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [subjectForm, setSubjectForm] = useState({ title: '', description: '', icon: '📚', color: '#6366f1' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', content: '', subject: '', difficulty: 'beginner', duration: 10, xpReward: 50 });
  const [quizForm, setQuizForm] = useState({
    title: '',
    subject: '',
    passingScore: 70,
    timeLimit: 600,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10 }] as QuizQuestion[]
  });
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [activeTab, setActiveTab] = useState<'subject' | 'lesson' | 'quiz'>('subject');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [analyticsRes, subjectsRes] = await Promise.all([
        analyticsAPI.getTeacherAnalytics(),
        subjectAPI.getAll()
      ]);
      setAnalytics(analyticsRes.data.analytics as TeacherAnalytics);
      setSubjects((subjectsRes.data.subjects || []) as SubjectItem[]);
    } catch (error: unknown) {
      const message = readApiError(error, 'Failed to load teacher analytics');
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const applyLessonTemplate = () => {
    setLessonForm((prev) => ({
      ...prev,
      content: `Overview\n- Learning objective:\n- Prerequisite:\n\nCore Concepts\n1)\n2)\n3)\n\nWorked Example\n- Problem:\n- Step-by-step solution:\n\nPractice Tasks\n- Easy:\n- Medium:\n- Challenging:\n\nSummary\n- Key takeaway 1\n- Key takeaway 2\n- Key takeaway 3`
    }));
  };

  const addQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10 }]
    }));
  };

  const removeQuestion = (idx: number) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const updateQuestion = (idx: number, patch: Partial<QuizQuestion>) => {
    setQuizForm((prev) => {
      const next = [...prev.questions];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, questions: next };
    });
  };

  const updateQuestionOption = (qIdx: number, opIdx: number, value: string) => {
    setQuizForm((prev) => {
      const next = [...prev.questions];
      const options = [...next[qIdx].options];
      options[opIdx] = value;
      next[qIdx] = { ...next[qIdx], options };
      return { ...prev, questions: next };
    });
  };

  const createSubject = async () => {
    if (subjectForm.title.trim().length < 3) {
      toast.error('Subject title should be at least 3 characters');
      return;
    }
    if (subjectForm.description.trim().length < 12) {
      toast.error('Subject description should be at least 12 characters');
      return;
    }

    try {
      await subjectAPI.create(subjectForm);
      toast.success('Subject created successfully!');
      setSubjectForm({ title: '', description: '', icon: '📚', color: '#6366f1' });
      fetchData();
    } catch (error: unknown) {
      toast.error(readApiError(error, 'Failed to create subject'));
    }
  };

  const createLesson = async () => {
    if (!lessonForm.subject) {
      toast.error('Please select a subject');
      return;
    }
    if (lessonForm.title.trim().length < 4) {
      toast.error('Lesson title should be at least 4 characters');
      return;
    }
    if (lessonForm.description.trim().length < 20) {
      toast.error('Lesson description should be at least 20 characters');
      return;
    }
    if (lessonForm.content.trim().length < 120) {
      toast.error('Lesson content is too short. Add more details for students.');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(lessonForm).forEach(([k, v]) => formData.append(k, String(v)));
      await lessonAPI.create(formData);
      toast.success('Lesson created successfully!');
      setLessonForm({ title: '', description: '', content: '', subject: '', difficulty: 'beginner', duration: 10, xpReward: 50 });
    } catch (error: unknown) {
      toast.error(readApiError(error, 'Failed to create lesson'));
    }
  };

  const createQuiz = async () => {
    if (!quizForm.subject) {
      toast.error('Please select a subject for quiz');
      return;
    }
    if (quizForm.title.trim().length < 4) {
      toast.error('Quiz title should be at least 4 characters');
      return;
    }
    const invalidQuestion = quizForm.questions.find((q) => !q.question.trim() || q.options.some((o) => !o.trim()));
    if (invalidQuestion) {
      toast.error('Fill all quiz questions and options before publishing');
      return;
    }

    try {
      await quizAPI.create({ ...quizForm, isPublished: true, maxAttempts: 3, xpReward: 100 });
      toast.success('Quiz created successfully!');
      setQuizForm({
        title: '',
        subject: '',
        passingScore: 70,
        timeLimit: 600,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10 }]
      });
    } catch (error: unknown) {
      toast.error(readApiError(error, 'Failed to create quiz'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!analytics) {
    return (
      <ProtectedRoute roles={['teacher', 'admin']}>
        <div className="min-h-screen">
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h1 className="text-2xl font-bold mb-2">Teacher panel is temporarily unavailable</h1>
              <p className="text-[var(--muted-foreground)] mb-5">
                {errorMessage || 'We could not load analytics right now. Please try again.'}
              </p>
              <button
                onClick={fetchData}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-medium"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const monthlyData = {
    labels: analytics.monthlyActivity.map((m) => `${m._id.month}/${m._id.year}`),
    datasets: [
      {
        label: 'Quiz Attempts',
        data: analytics.monthlyActivity.map((m) => m.count),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.22)',
        tension: 0.35,
        fill: true
      }
    ]
  };

  const hardestData = {
    labels: analytics.hardestQuizzes.map((q) => q.quiz.title),
    datasets: [
      {
        label: 'Average Score %',
        data: analytics.hardestQuizzes.map((q) => Math.round(q.avgScore)),
        backgroundColor: '#f97316'
      }
    ]
  };

  return (
    <ProtectedRoute roles={['teacher', 'admin']}>
      <div className="min-h-screen relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(20,184,166,0.2),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(249,115,22,0.22),transparent_30%),linear-gradient(180deg,#f8fcfb_0%,#f6f9ff_50%,#f5f7fb_100%)] dark:bg-[radial-gradient(circle_at_12%_20%,rgba(20,184,166,0.14),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(249,115,22,0.14),transparent_30%),linear-gradient(180deg,#0b1220_0%,#111827_50%,#0f1525_100%)]" />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="mb-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-3">
                  <Sparkles size={14} /> Instructor Studio
                </p>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Teacher & Admin Panel</h1>
                <p className="text-[var(--muted-foreground)] mt-2 text-base leading-relaxed">
                  Kontent yaratish, oquvchilar progressini kuzatish va kurs sifatini professional darajada boshqarish.
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] px-4 py-3 min-w-56">
                <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Current Snapshot</p>
                <p className="font-semibold mt-1">{analytics.overview.totalStudents} learners, {analytics.overview.totalLessons} lessons</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Average score: {analytics.overview.avgScore}%</p>
              </div>
            </div>
          </section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Students" value={analytics.overview.totalStudents} icon={Users} color="text-teal-600" />
            <StatsCard title="Published Lessons" value={analytics.overview.totalLessons} icon={BookOpen} color="text-sky-600" />
            <StatsCard title="Quiz Attempts" value={analytics.overview.totalQuizResults} icon={Trophy} color="text-orange-600" />
            <StatsCard title="Avg Quiz Score" value={`${analytics.overview.avgScore}%`} icon={TrendingUp} color="text-emerald-600" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h3 className="font-semibold mb-4">Monthly Learning Activity</h3>
              <Line
                data={monthlyData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }}
              />
            </div>
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6">
              <h3 className="font-semibold mb-4">Most Difficult Quizzes</h3>
              <Bar
                data={hardestData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100 } }
                }}
              />
            </div>
          </div>

          <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex flex-wrap gap-3 mb-5">
              <button
                onClick={() => setActiveTab('subject')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'subject' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-[var(--card)] border border-black/10 dark:border-white/10'}`}
              >
                <span className="inline-flex items-center gap-2"><Layers3 size={15} /> Subject Builder</span>
              </button>
              <button
                onClick={() => setActiveTab('lesson')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'lesson' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-[var(--card)] border border-black/10 dark:border-white/10'}`}
              >
                <span className="inline-flex items-center gap-2"><ClipboardList size={15} /> Lesson Builder</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'quiz' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-[var(--card)] border border-black/10 dark:border-white/10'}`}
              >
                <span className="inline-flex items-center gap-2"><CircleCheck size={15} /> Quiz Builder</span>
              </button>
            </div>

            {activeTab === 'subject' && (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Create Subject</h3>
                <div className="space-y-3">
                  <input value={subjectForm.title} onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })} placeholder="Subject title" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" />
                  <textarea value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" rows={3} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={subjectForm.icon} onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })} placeholder="Icon" className="px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" />
                    <input value={subjectForm.color} onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })} placeholder="Color" className="px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" />
                  </div>
                  <button onClick={createSubject} className="w-full px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white flex items-center justify-center gap-2 font-medium">
                    <Save size={16} /> Save Subject
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'lesson' && (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Plus size={18} /> Create Lesson</h3>
                  <button onClick={applyLessonTemplate} className="px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                    Insert structured template
                  </button>
                </div>
                <div className="space-y-3">
                  <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" />
                  <textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" rows={2} />
                  <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="Lesson content" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" rows={10} />
                  <div className="grid sm:grid-cols-4 gap-2">
                    <select value={lessonForm.subject} onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent sm:col-span-2">
                      <option value="">Select Subject</option>
                      {subjects.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                    </select>
                    <select value={lessonForm.difficulty} onChange={(e) => setLessonForm({ ...lessonForm, difficulty: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <input type="number" min={5} value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: Number(e.target.value) || 10 })} placeholder="Duration" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" />
                  </div>
                  <button onClick={createLesson} className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Publish Lesson</button>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Create Quiz</h3>
                <div className="space-y-3 mb-4">
                  <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Quiz title" className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" />
                  <div className="grid sm:grid-cols-3 gap-2">
                    <select value={quizForm.subject} onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent">
                      <option value="">Select Subject</option>
                      {subjects.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                    </select>
                    <input type="number" min={40} max={100} value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) || 70 })} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" placeholder="Passing score" />
                    <input type="number" min={120} value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) || 600 })} className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent" placeholder="Time limit (sec)" />
                  </div>
                </div>

                <div className="space-y-4">
                  {quizForm.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium">Question {qIdx + 1}</p>
                        {quizForm.questions.length > 1 && (
                          <button onClick={() => removeQuestion(qIdx)} className="text-sm text-red-500 hover:text-red-600">Remove</button>
                        )}
                      </div>

                      <input
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                        placeholder="Question"
                        className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent mb-2"
                      />

                      <div className="grid sm:grid-cols-2 gap-2 mb-2">
                        {q.options.map((op, opIdx) => (
                          <input
                            key={opIdx}
                            value={op}
                            onChange={(e) => updateQuestionOption(qIdx, opIdx, e.target.value)}
                            placeholder={`Option ${opIdx + 1}`}
                            className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent"
                          />
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(qIdx, { correctAnswer: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent"
                        >
                          <option value={0}>Correct: Option 1</option>
                          <option value={1}>Correct: Option 2</option>
                          <option value={2}>Correct: Option 3</option>
                          <option value={3}>Correct: Option 4</option>
                        </select>
                        <input
                          type="number"
                          min={5}
                          value={q.points}
                          onChange={(e) => updateQuestion(qIdx, { points: Number(e.target.value) || 10 })}
                          placeholder="Points"
                          className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent"
                        />
                      </div>

                      <textarea
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                        placeholder="Explanation"
                        rows={2}
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button onClick={addQuestion} className="px-4 py-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-sm font-medium">Add Question</button>
                  <button onClick={createQuiz} className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium sm:ml-auto">Publish Quiz</button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
