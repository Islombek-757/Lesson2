'use client';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LessonCard from '@/components/LessonCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchBar from '@/components/SearchBar';
import { Sparkles, LibraryBig, GraduationCap, PencilRuler, TimerReset } from 'lucide-react';
import { lessonAPI, subjectAPI } from '@/lib/api';
import toast from 'react-hot-toast';

type LessonListItem = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  duration?: number;
  views?: number;
  xpReward?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  thumbnail?: string;
  subject?: { _id: string; title: string; icon?: string };
};

type SubjectItem = {
  _id: string;
  title: string;
  icon?: string;
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  const totalXP = lessons.reduce((sum, lesson) => sum + (lesson.xpReward || 0), 0);
  const beginnerCount = lessons.filter((lesson) => lesson.difficulty === 'beginner').length;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [lessonsRes, subjectsRes] = await Promise.all([
        lessonAPI.getAll({ subject: selectedSubject || undefined, difficulty: selectedDifficulty || undefined }),
        subjectAPI.getAll()
      ]);
      setLessons(lessonsRes.data.lessons || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedDifficulty]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookmark = async (lessonId: string) => {
    try {
      await lessonAPI.bookmark(lessonId);
      toast.success('Lesson bookmarked!');
    } catch {
      toast.error('Please sign in to bookmark lessons');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_85%_2%,rgba(251,191,36,0.2),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.16),transparent_36%),linear-gradient(180deg,#fffef8_0%,#f4f8ff_50%,#eff7f4_100%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_85%_2%,rgba(251,191,36,0.15),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.11),transparent_36%),linear-gradient(180deg,#0a1322_0%,#0e1a2a_50%,#0e1b18_100%)]" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-10 rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 backdrop-blur-md p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-900 dark:bg-sky-400/20 dark:text-sky-100 px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-4">
                <Sparkles size={14} /> Curriculum Library
              </p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">Lesson Studio</h1>
              <p className="text-[var(--muted-foreground)] max-w-2xl text-base sm:text-lg leading-relaxed mb-5">
                Har bir kartochka oddiy post emas, balki mini dars moduli: nazariya, amaliy mashq va testga tayyor yo&apos;naltirish.
              </p>

              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 5).map((subject) => (
                  <span key={subject._id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-black/10 dark:border-white/10 bg-[var(--card)]">
                    {subject.icon} {subject.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-3">Study Snapshot</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><LibraryBig size={13} /> Modules</p>
                  <p className="text-2xl font-black mt-1">{lessons.length}</p>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><GraduationCap size={13} /> Subjects</p>
                  <p className="text-2xl font-black mt-1">{subjects.length}</p>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><TimerReset size={13} /> Total Time</p>
                  <p className="text-2xl font-black mt-1">{totalDuration}m</p>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1"><PencilRuler size={13} /> Beginner</p>
                  <p className="text-2xl font-black mt-1">{beginnerCount}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/30 p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Potential XP from shown lessons</p>
                <p className="text-lg font-bold text-sky-700 dark:text-sky-300">{totalXP} XP</p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-3xl mb-8 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/55 backdrop-blur-md overflow-hidden">
          <div className="h-2 bg-[linear-gradient(90deg,#0ea5e9_0%,#14b8a6_50%,#f59e0b_100%)]" />
          <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <SearchBar />
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-[var(--card)] border border-black/10 dark:border-white/10"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.icon} {s.title}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-[var(--card)] border border-black/10 dark:border-white/10"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-12 text-center">
            <p className="text-[var(--muted-foreground)]">No lessons found for selected filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard key={lesson._id} lesson={lesson} onBookmark={handleBookmark} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
