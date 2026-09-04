import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-bg flex w-full min-w-0 items-center justify-center px-4 py-8 sm:min-h-[calc(100vh-8rem)] sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full min-w-0 max-w-md"
      >
        <div className="glass-card min-w-0 p-4 sm:p-6 md:p-8">
          <div className="mb-8 text-center">
            <Link to="/" className="group mb-5 inline-flex items-center gap-2.5">
              <div className="logo-mark h-11 w-11 text-sm">
                TS
              </div>
            </Link>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-balance text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          {children}
          {footer && (
            <div className="mt-6 text-balance text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
