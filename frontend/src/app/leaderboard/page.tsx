'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { userAPI } from '@/lib/api';
import { Trophy, Flame, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    userAPI.getLeaderboard().then((res) => setUsers(res.data.leaderboard || [])).catch(() => setUsers([]));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3">Global Leaderboard</h1>
          <p className="text-[var(--muted-foreground)]">Top performing students by XP and consistency</p>
        </div>

        <div className="space-y-3">
          {users.map((user, idx) => (
            <div key={user._id} className={`glass rounded-2xl p-4 flex items-center justify-between ${idx < 3 ? 'border border-yellow-500/30' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-gray-400/20 text-gray-300' : idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  #{idx + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Level {user.level}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1 text-orange-400"><Flame size={14} />{user.streak}</span>
                <span className="flex items-center gap-1 text-yellow-400"><Star size={14} />{user.badges?.length || 0}</span>
                <span className="flex items-center gap-1 text-indigo-400 font-semibold"><Trophy size={14} />{user.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
