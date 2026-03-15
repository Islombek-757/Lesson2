'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, BookOpen, Trophy, Brain, CheckCircle, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';

const stats = [
  { label: 'Active Students', value: '12,000+', icon: Users },
  { label: 'Lessons Available', value: '850+', icon: BookOpen },
  { label: 'Quiz Completions', value: '95,000+', icon: Trophy },
  { label: 'AI Tutor Sessions', value: '250,000+', icon: Brain }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Math Teacher',
    text: 'School OS transformed how I teach. The AI tutor and analytics give me incredible insights into student progress.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Student',
    text: 'I improved my grades by 30% in two months. The platform makes learning feel like a game!',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'School Principal',
    text: 'Best investment for our school. Teachers save time, and students are more engaged than ever.',
    rating: 5
  }
];

const features = [
  {
    title: 'AI-Powered Tutor',
    description: '24/7 intelligent assistant that explains concepts, generates practice questions, and provides personalized hints.',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'Interactive Quizzes',
    description: 'Timed quizzes with instant feedback, leaderboard rankings, and achievement badges to keep students motivated.',
    icon: Trophy,
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'Smart Analytics',
    description: 'Track learning progress, identify difficult topics, and get actionable insights for better teaching outcomes.',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500'
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/90 text-sm mb-8">
              <Sparkles size={16} />
              Powered by AI • Built for Modern Education
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                School Learning
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your classroom with AI-powered lessons, interactive quizzes, and real-time analytics.
              Teach smarter. Learn faster. Achieve more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link
                href="/lessons"
                className="group px-8 py-4 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-lg transition-all flex items-center gap-2"
              >
                Start Learning
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-2xl glass text-white hover:bg-white/20 font-semibold text-lg transition-all"
              >
                Join as Teacher
              </Link>
            </div>

            <div className="max-w-md mx-auto">
              <SearchBar />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass rounded-2xl p-6 text-center card-hover"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Icon size={24} />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              A complete education ecosystem designed for students, teachers, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="glass rounded-3xl p-8 card-hover"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">Meet Your AI-Enhanced Teacher</h2>
                <p className="text-lg text-[var(--muted-foreground)] mb-6">
                  Combine human expertise with AI intelligence. Teachers create engaging lessons,
                  while AI provides personalized support to every student.
                </p>
                <ul className="space-y-3">
                  {[
                    'Create interactive lessons in minutes',
                    'Track each student’s progress in real-time',
                    'Generate quizzes automatically with AI',
                    'Identify struggling students early'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-500 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 p-1">
                  <div className="w-full h-full rounded-3xl glass flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 mb-4 flex items-center justify-center text-3xl text-white font-bold">
                        T
                      </div>
                      <h3 className="text-2xl font-bold">Prof. Thompson</h3>
                      <p className="text-[var(--muted-foreground)]">Senior Mathematics Teacher</p>
                      <div className="flex items-center justify-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className="text-yellow-500 fill-current" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-14">Loved by Educators Worldwide</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className="text-yellow-500 fill-current" />)}
                </div>
                <p className="text-[var(--muted-foreground)] mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
