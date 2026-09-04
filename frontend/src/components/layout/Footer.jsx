export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent dark:via-brand-500/10" />
      <div className="page-container flex flex-col items-center justify-between gap-4 py-10 text-center sm:flex-row sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex items-center gap-2">
            <div className="logo-mark h-7 w-7 text-xs">TS</div>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Think<span className="text-brand-600 dark:text-brand-400">Stack</span>
            </span>
          </div>
          <p className="max-w-full text-balance text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} ThinkStack. Built for learning DSA interactively.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm sm:gap-6">
          <a
            href="/docs"
            className="font-medium text-slate-500 transition-colors duration-200 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            Documentation
          </a>
          <a
            href="https://github.com"
            className="font-medium text-slate-500 transition-colors duration-200 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
