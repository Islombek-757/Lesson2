'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import AITutorChat from '@/components/AITutorChat';
import { lessonAPI, quizAPI, aiAPI } from '@/lib/api';
import { Clock, Eye, Star, Bookmark, CheckCircle, Brain, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LessonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [lessonQuiz, setLessonQuiz] = useState<any>(null);

  useEffect(() => {
    if (slug) fetchLesson();
  }, [slug]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const res = await lessonAPI.getOne(slug);
      setLesson(res.data.lesson);
      setBookmarked(res.data.isBookmarked || false);

      const quizzesRes = await quizAPI.getAll({ lesson: res.data.lesson._id });
      const firstQuiz = quizzesRes.data.quizzes?.[0];
      if (firstQuiz) setLessonQuiz(firstQuiz);
    } catch {
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const res = await lessonAPI.bookmark(lesson._id);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Lesson bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const markComplete = async () => {
    try {
      const res = await lessonAPI.complete(lesson._id);
      toast.success(`Lesson completed! +${res.data.xpEarned} XP`);
    } catch {
      toast.error('Failed to mark complete');
    }
  };

  const generateSummary = async () => {
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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm">
                  {lesson.subject?.icon} {lesson.subject?.title}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-sm capitalize">{lesson.difficulty}</span>
              </div>

              <h1 className="text-4xl font-bold mb-3">{lesson.title}</h1>
              <p className="text-lg text-[var(--muted-foreground)] mb-6">{lesson.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)] mb-6">
                <span className="flex items-center gap-1"><Clock size={16} />{lesson.duration} min</span>
                <span className="flex items-center gap-1"><Eye size={16} />{lesson.views} views</span>
                <span className="flex items-center gap-1"><Star size={16} />{lesson.xpReward} XP</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={toggleBookmark} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2 transition-colors">
                  <Bookmark size={16} /> {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button onClick={markComplete} className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-colors">
                  <CheckCircle size={16} /> Mark Complete
                </button>
                <button onClick={generateSummary} disabled={summaryLoading} className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2 transition-colors disabled:opacity-50">
                  <FileText size={16} /> {summaryLoading ? 'Generating...' : 'AI Summary'}
                </button>
              </div>
            </div>

            {lesson.videoUrl && (
              <div className="glass rounded-2xl p-4">
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

            <div className="glass rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4">Lesson Content</h3>
              <article className="prose max-w-none">
                <p className="whitespace-pre-wrap">{lesson.content}</p>
              </article>
            </div>

            {summary && (
              <div className="glass rounded-2xl p-6 border border-indigo-500/30">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Brain size={20} className="text-indigo-500" /> AI Lesson Summary
                </h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{summary}</p>
                </div>
              </div>
            )}

            {lessonQuiz && (
              <div className="glass rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Ready to test your knowledge?</h3>
                  <p className="text-[var(--muted-foreground)] mt-1">Take the quiz for this lesson and earn XP.</p>
                </div>
                <Link href={`/quiz/${lessonQuiz._id}`} className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors">
                  Start Quiz
                </Link>
              </div>
            )}
          </div>

          <div>
            <AITutorChat lessonContext={`${lesson.title}\n${lesson.description}\n${lesson.content.substring(0, 2000)}`} />
          </div>
        </div>
      </main>
    </div>
  );
}
