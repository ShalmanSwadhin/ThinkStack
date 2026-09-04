import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

const features = [
  {
    title: 'Structured Learning',
    description: '22+ DSA topics with theory, examples, complexity analysis, and interview prep.',
    icon: '📚',
  },
  {
    title: 'Interactive Visualizer',
    description: 'Step through sorting, searching, tree, and graph algorithms with full controls.',
    icon: '🎬',
  },
  {
    title: 'Coding Practice',
    description: 'LeetCode-style problems with automated grading via Judge0 in 5 languages.',
    icon: '💻',
  },
  {
    title: 'AI Tutor',
    description: 'Google Gemini-powered assistant for explanations, hints, and code review.',
    icon: '🤖',
  },
  {
    title: 'Gamification',
    description: 'Earn XP, level up, collect badges, maintain streaks, and climb leaderboards.',
    icon: '🏆',
  },
  {
    title: 'Contests',
    description: 'Timed competitive programming events with live standings.',
    icon: '⚡',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950" />
        <div className="page-container text-center">
          <motion.div initial="initial" animate="animate" variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="badge-brand mb-5 inline-flex px-4 py-1.5 text-sm">
              Interactive DSA Learning Platform
            </span>
            <h1 className="mx-auto max-w-4xl text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Master Data Structures & Algorithms{' '}
              <span className="gradient-text">Visually</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              ThinkStack combines LeetCode-style practice, Visualgo-inspired animations, structured
              theory, AI tutoring, and gamification — all in one production-ready platform.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg">Start Learning Free</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="page-container">
          <div className="mb-14 text-center">
            <h2 className="section-heading">Everything you need to ace DSA</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              One unified platform replacing scattered resources.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Card glass elevated className="h-full">
                  <CardHeader>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl dark:bg-brand-950/60">
                      {feature.icon}
                    </span>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="page-container">
          <Card
            glass
            className="relative overflow-hidden border-0 bg-gradient-to-br from-brand-600 via-brand-600 to-indigo-700 text-white shadow-soft-lg"
          >
            <CardContent className="flex flex-col items-center py-10 text-center sm:py-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to level up your DSA skills?</h2>
              <p className="mt-3 max-w-lg text-brand-100">
                Join ThinkStack and learn with visualizations, practice problems, and an AI tutor.
              </p>
              <Link to="/register" className="mt-8">
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-white/20 bg-white text-brand-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
