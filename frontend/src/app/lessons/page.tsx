'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LessonCard from '@/components/LessonCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchBar from '@/components/SearchBar';
import { lessonAPI, subjectAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, subjectsRes] = await Promise.all([
        lessonAPI.getAll({ subject: selectedSubject || undefined, difficulty: selectedDifficulty || undefined }),
        subjectAPI.getAll()
      ]);
      setLessons(lessonsRes.data.lessons || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSubject, selectedDifficulty]);

  const handleBookmark = async (lessonId: string) => {
    try {
      await lessonAPI.bookmark(lessonId);
      toast.success('Lesson bookmarked!');
    } catch {
      toast.error('Please sign in to bookmark lessons');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Explore Lessons</h1>
          <p className="text-[var(--muted-foreground)]">Discover AI-enhanced lessons across all subjects</p>
        </div>

        <div className="glass rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <SearchBar />
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.icon} {s.title}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : lessons.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
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
