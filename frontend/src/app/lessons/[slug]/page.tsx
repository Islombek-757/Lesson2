'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import AITutorChat from '@/components/AITutorChat';
import { lessonAPI, quizAPI, aiAPI } from '@/lib/api';
import { Clock, Eye, Star, Bookmark, CheckCircle, Brain, FileText, BookOpenText, Sparkles, GraduationCap, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type LessonDetail = {
  _id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  views: number;
  xpReward: number;
  videoUrl?: string;
  subject?: { title?: string; icon?: string };
};

type QuizLite = {
  _id: string;
};

const readApiError = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeError = error as { response?: { data?: { error?: string } } };
    return maybeError.response?.data?.error || fallback;
  }
  return fallback;
};

export default function LessonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [lessonQuiz, setLessonQuiz] = useState<QuizLite | null>(null);

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      const res = await lessonAPI.getOne(slug);
      setLesson(res.data.lesson as LessonDetail);
      setBookmarked(res.data.isBookmarked || false);

      const quizzesRes = await quizAPI.getAll({ lesson: res.data.lesson._id });
      const firstQuiz = (quizzesRes.data.quizzes?.[0] || null) as QuizLite | null;
      if (firstQuiz) setLessonQuiz(firstQuiz);
    } catch (error: unknown) {
      toast.error(readApiError(error, 'Failed to load lesson'));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchLesson();
  }, [slug, fetchLesson]);

  const toggleBookmark = async () => {
    if (!lesson) return;
    try {
      const res = await lessonAPI.bookmark(lesson._id);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Lesson bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const markComplete = async () => {
    if (!lesson) return;
    try {
      const res = await lessonAPI.complete(lesson._id);
      toast.success(`Lesson completed! +${res.data.xpEarned} XP`);
    } catch {
      toast.error('Failed to mark complete');
    }
  };

  const generateSummary = async () => {
    if (!lesson) return;
    try {
      setSummaryLoading(true);
      const res = await aiAPI.summarize({ title: lesson.title, content: lesson.content });
      setSummary(res.data.summary);
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lesson) return <div className="min-h-screen flex items-center justify-center">Lesson not found</div>;

  const contentSections = lesson.content
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section, index) => {
      const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
      const firstLine = lines[0] || `Module ${index + 1}`;
      const looksLikeHeading = lines.length > 1 && firstLine.length < 40 && !firstLine.endsWith('.') && !firstLine.includes(':');
      return {
        title: looksLikeHeading ? firstLine : `Module ${index + 1}`,
        body: looksLikeHeading ? lines.slice(1).join('\n') : lines.join('\n')
      };
    });

  const learningPoints = contentSections.slice(0, 4).map((section, index) => ({
    label: section.title,
    index: index + 1
  }));

  const lessonContext = `${lesson.title}\n${lesson.description}\n${lesson.content.substring(0, 2000)}`;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_15%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_92%_0%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(180deg,#fffef9_0%,#f5f9ff_46%,#f4faf7_100%)] dark:bg-[radial-gradient(circle_at_8%_15%,rgba(56,189,248,0.14),transparent_35%),radial-gradient(circle_at_92%_0%,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.10),transparent_34%),linear-gradient(180deg,#091220_0%,#0f1826_46%,#0c1715_100%)]" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm shadow-[0_14px_45px_rgba(15,23,42,0.08)]">
              <div className="h-2 bg-[linear-gradient(90deg,#0ea5e9_0%,#14b8a6_52%,#f59e0b_100%)]" />
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1"><GraduationCap size={14} /> {lesson.subject?.icon} {lesson.subject?.title}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm capitalize font-semibold">{lesson.difficulty}</span>
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200 text-sm font-semibold inline-flex items-center gap-1">
                    <Sparkles size={14} /> Classroom Reader
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 leading-tight">{lesson.title}</h1>
                <p className="text-lg text-[var(--muted-foreground)] mb-6 leading-relaxed max-w-3xl">{lesson.description}</p>

                <div className="grid sm:grid-cols-3 gap-3 mb-7">
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Study Time</p>
                    <p className="text-2xl font-black inline-flex items-center gap-2"><Clock size={18} /> {lesson.duration} min</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Views</p>
                    <p className="text-2xl font-black inline-flex items-center gap-2"><Eye size={18} /> {lesson.views}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-4">
                    <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Reward</p>
                    <p className="text-2xl font-black inline-flex items-center gap-2"><Star size={18} /> {lesson.xpReward} XP</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={toggleBookmark} className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-[var(--card)] hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 transition-colors font-medium">
                    <Bookmark size={16} /> {bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button onClick={markComplete} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors font-medium">
                    <CheckCircle size={16} /> Mark Complete
                  </button>
                  <button onClick={generateSummary} disabled={summaryLoading} className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 transition-colors disabled:opacity-50 font-medium">
                    <FileText size={16} /> {summaryLoading ? 'Generating...' : 'AI Summary'}
                  </button>
                </div>
              </div>
            </div>

            {lesson.videoUrl && (
              <div className="rounded-2xl p-4 border border-black/10 dark:border-white/10 bg-[var(--card)]">
                <h3 className="font-semibold mb-3">Lesson Video</h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              </div>
            )}

            <div className="rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2"><BookOpenText size={22} /> Lesson Content</h3>
                <div className="text-sm text-[var(--muted-foreground)] inline-flex items-center gap-2">
                  <Target size={16} /> {contentSections.length} learning blocks
                </div>
              </div>

              <div className="space-y-4">
                {contentSections.map((section, index) => (
                  <section key={`${section.title}-${index}`} className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Learning Block</p>
                        <h4 className="text-xl font-bold">{section.title}</h4>
                      </div>
                    </div>
                    <div className="prose max-w-none text-[1.02rem] leading-8">
                      <p className="whitespace-pre-wrap">{section.body}</p>
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {summary && (
              <div className="rounded-2xl p-6 border border-orange-300/50 dark:border-orange-500/30 bg-orange-50/70 dark:bg-orange-500/10">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Brain size={20} className="text-orange-500" /> AI Lesson Summary
                </h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{summary}</p>
                </div>
              </div>
            )}

            {lessonQuiz && (
              <div className="rounded-2xl p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border border-black/10 dark:border-white/10 bg-[var(--card)]">
                <div>
                  <h3 className="text-xl font-bold">Ready to test your knowledge?</h3>
                  <p className="text-[var(--muted-foreground)] mt-1">Take the quiz for this lesson and earn XP.</p>
                </div>
                <Link href={`/quiz/${lessonQuiz._id}`} className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-semibold transition-colors text-center">
                  Start Quiz
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/65 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-[linear-gradient(90deg,#0ea5e9_0%,#14b8a6_55%,#f59e0b_100%)]" />
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-3">Lesson Roadmap</p>
                  <div className="space-y-3">
                    {learningPoints.map((point) => (
                      <div key={point.index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shrink-0">
                          {point.index}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{point.label}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Read, understand, and practice this block</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <AITutorChat lessonContext={lessonContext} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
