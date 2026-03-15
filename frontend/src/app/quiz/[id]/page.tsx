'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import QuizPlayer from '@/components/QuizPlayer';
import { quizAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function QuizDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizAPI.getOne(id);
      setQuiz(res.data.quiz);
    } catch {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz not found</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <QuizPlayer quiz={quiz} />
      </main>
    </div>
  );
}
