import Link from 'next/link';
import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
                <GraduationCap size={18} />
              </div>
              <span className="gradient-text">School OS</span>
            </div>
            <p className="text-[var(--muted-foreground)] max-w-md mb-6">
              AI-powered education platform built for modern classrooms.
              Learn faster, teach smarter, and track progress like never before.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><Github size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><Twitter size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><Linkedin size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li><Link href="/lessons" className="hover:text-[var(--foreground)]">Lessons</Link></li>
              <li><Link href="/quiz" className="hover:text-[var(--foreground)]">Quizzes</Link></li>
              <li><Link href="/student" className="hover:text-[var(--foreground)]">Dashboard</Link></li>
              <li><Link href="/teacher" className="hover:text-[var(--foreground)]">Teacher Panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li><a href="#" className="hover:text-[var(--foreground)]">About</a></li>
              <li><a href="#" className="hover:text-[var(--foreground)]">Pricing</a></li>
              <li><a href="#" className="hover:text-[var(--foreground)]">Contact</a></li>
              <li><a href="#" className="hover:text-[var(--foreground)]">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-sm text-[var(--muted-foreground)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 School OS. All rights reserved.</p>
          <p>Built with Next.js + AI</p>
        </div>
      </div>
    </footer>
  );
}
