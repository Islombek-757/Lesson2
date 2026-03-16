import Link from 'next/link';
import { Clock, Eye, Star, Bookmark } from 'lucide-react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/constants';

type LessonCardLesson = {
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
  subject?: { title?: string; icon?: string };
};

interface LessonCardProps {
  lesson: LessonCardLesson;
  onBookmark?: (id: string) => void;
}

export default function LessonCard({ lesson, onBookmark }: LessonCardProps) {
  const coverGradient =
    lesson.difficulty === 'advanced'
      ? 'from-rose-500/70 via-orange-500/70 to-amber-400/70'
      : lesson.difficulty === 'intermediate'
        ? 'from-cyan-500/70 via-sky-500/70 to-emerald-400/70'
        : 'from-emerald-500/70 via-teal-500/70 to-cyan-400/70';

  const moduleTone =
    lesson.difficulty === 'advanced'
      ? 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-500/20'
      : lesson.difficulty === 'intermediate'
        ? 'text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/20'
        : 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20';

  return (
    <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-[0_14px_40px_rgba(15,23,42,0.08)] card-hover group relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[linear-gradient(180deg,#0ea5e9_0%,#14b8a6_50%,#f59e0b_100%)]" />
      <div className={`h-44 bg-gradient-to-br ${coverGradient} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.25),transparent_40%)]" />
        <div className="absolute inset-x-0 top-0 h-full bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.14)_0px,rgba(255,255,255,0.14)_1px,transparent_1px,transparent_24px)]" />
        {lesson.thumbnail && (
          <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => onBookmark?.(lesson._id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <Bookmark size={16} />
        </button>

        <div className="absolute left-3 bottom-3 text-xs px-2.5 py-1 rounded-full bg-white/85 text-slate-900 font-semibold">
          {lesson.subject?.icon} {lesson.subject?.title}
        </div>

        <div className={`absolute left-3 top-3 text-[11px] px-2 py-1 rounded-full font-bold ${moduleTone}`}>
          Module Card
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${DIFFICULTY_COLORS[lesson.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner}`}>
            {DIFFICULTY_LABELS[lesson.difficulty as keyof typeof DIFFICULTY_LABELS] || 'Beginner'}
          </span>
          {lesson.tags?.[0] && <span className="text-xs text-[var(--muted-foreground)]">#{lesson.tags[0]}</span>}
        </div>

        <h3 className="font-bold text-xl mb-2 line-clamp-2">{lesson.title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-5 leading-relaxed">{lesson.description}</p>

        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-4">
          <div className="flex items-center gap-1"><Clock size={14} />{lesson.duration || 0} min</div>
          <div className="flex items-center gap-1"><Eye size={14} />{lesson.views || 0}</div>
          <div className="flex items-center gap-1"><Star size={14} />{lesson.xpReward || 0} XP</div>
        </div>

        <div className="mb-4">
          <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full ${lesson.difficulty === 'advanced' ? 'bg-orange-500 w-[86%]' : lesson.difficulty === 'intermediate' ? 'bg-sky-500 w-[64%]' : 'bg-emerald-500 w-[42%]'}`}
            />
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Syllabus depth preview</p>
        </div>

        <Link
          href={`/lessons/${lesson.slug}`}
          className="w-full block text-center py-3 rounded-xl bg-slate-900 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-semibold transition-colors"
        >
          Enter Classroom
        </Link>
      </div>
    </div>
  );
}
