import Link from 'next/link';
import { Clock, Eye, Star, Bookmark } from 'lucide-react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/constants';

interface LessonCardProps {
  lesson: any;
  onBookmark?: (id: string) => void;
}

export default function LessonCard({ lesson, onBookmark }: LessonCardProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden card-hover group">
      <div className="h-40 bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 relative">
        {lesson.thumbnail && (
          <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => onBookmark?.(lesson._id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <Bookmark size={16} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${DIFFICULTY_COLORS[lesson.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner}`}>
            {DIFFICULTY_LABELS[lesson.difficulty as keyof typeof DIFFICULTY_LABELS] || 'Beginner'}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">{lesson.subject?.icon} {lesson.subject?.title}</span>
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2">{lesson.title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">{lesson.description}</p>

        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-4">
          <div className="flex items-center gap-1"><Clock size={14} />{lesson.duration} min</div>
          <div className="flex items-center gap-1"><Eye size={14} />{lesson.views}</div>
          <div className="flex items-center gap-1"><Star size={14} />{lesson.xpReward} XP</div>
        </div>

        <Link
          href={`/lessons/${lesson.slug}`}
          className="w-full block text-center py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
        >
          Start Lesson
        </Link>
      </div>
    </div>
  );
}
