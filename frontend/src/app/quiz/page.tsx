'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { quizAPI } from '@/lib/api';
import Link from 'next/link';
import { Clock, Trophy } from 'lucide-react';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    quizAPI.getAll().then((res) => setQuizzes(res.data.quizzes || [])).catch(() => setQuizzes([]));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-2">Quizzes</h1>
        <p className="text-[var(--muted-foreground)] mb-8">Challenge yourself and climb the leaderboard</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">{quiz.subject?.title}</p>
              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mb-5">
                <span className="flex items-center gap-1"><Clock size={14} />{Math.floor((quiz.timeLimit || 600) / 60)} min</span>
                <span className="flex items-center gap-1"><Trophy size={14} />Pass {quiz.passingScore}%</span>
              </div>
              <Link href={`/quiz/${quiz._id}`} className="block text-center py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium">
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
