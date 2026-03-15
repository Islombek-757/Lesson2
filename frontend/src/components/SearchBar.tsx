'use client';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { lessonAPI } from '@/lib/api';
import Link from 'next/link';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  description: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await lessonAPI.search(query);
        setResults(res.data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons, topics, tags..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X size={18} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-[var(--muted-foreground)]">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-[var(--muted-foreground)]">No results found</p>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <Link
                  key={result._id}
                  href={`/lessons/${result.slug}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <p className="font-medium text-sm">{result.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1">{result.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
