'use client';
import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { quizAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface QuizPlayerProps {
  quiz: any;
  onComplete?: (result: any) => void;
}

export default function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 600);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const timer = setInterval(() => setTimeLeft((prev: number) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  useEffect(() => {
    if (timeLeft === 0) handleSubmit();
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await quizAPI.submit(quiz._id, {
        answers,
        timeTaken: (quiz.timeLimit || 600) - timeLeft
      });
      setResult(res.data.result);
      onComplete?.(res.data.result);
      toast.success('Quiz submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
            result.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {result.passed ? <CheckCircle size={24} /> : <XCircle size={24} />}
            {result.passed ? 'Passed' : 'Failed'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Score</p>
            <p className="text-2xl font-bold">{result.percentage}%</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Correct</p>
            <p className="text-2xl font-bold">{result.earnedPoints}/{result.totalPoints}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">XP Earned</p>
            <p className="text-2xl font-bold text-indigo-500">+{result.xpEarned}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Time</p>
            <p className="text-2xl font-bold">{formatTime(result.timeTaken)}</p>
          </div>
        </div>

        <p className="text-center text-[var(--muted-foreground)]">{result.feedback}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Quiz is not available</h2>
        <p className="text-[var(--muted-foreground)]">This quiz has no valid questions yet.</p>
      </div>
    );
  }

  const safeIndex = Math.min(currentQuestion, questions.length - 1);
  const question = questions[safeIndex] || { question: 'Question unavailable', options: [] };
  const options = Array.isArray(question.options) ? question.options : [];
  const progress = ((safeIndex + 1) / questions.length) * 100;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Question {safeIndex + 1} of {questions.length}</p>
          <h2 className="text-xl font-bold mt-1">{quiz.title}</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 text-orange-500 font-semibold">
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6">{question.question}</h3>
        <div className="space-y-3">
          {options.map((option: string, idx: number) => (
            <button
              key={idx}
              onClick={() => selectAnswer(idx)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${
                answers[safeIndex] === idx
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={safeIndex === 0}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {safeIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2 transition-colors"
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
