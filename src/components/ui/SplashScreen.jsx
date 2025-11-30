import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark } from 'lucide-react';

/**
 * SplashScreen Component
 * Displays a loading screen with progress bar and status messages
 *
 * @param {Object} props
 * @param {number} props.progress - Loading progress (0-100)
 * @param {string} props.status - Current loading status message
 * @param {boolean} props.isComplete - Whether loading is complete
 * @param {function} props.onComplete - Callback when transition animation finishes
 */
const SplashScreen = ({ progress = 0, status = '', isComplete = false, onComplete }) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(14, 165, 233, 0.2)',
                    '0 0 40px rgba(14, 165, 233, 0.4)',
                    '0 0 20px rgba(14, 165, 233, 0.2)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Landmark className="w-12 h-12 text-primary-400" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl text-white font-bold tracking-tight mb-3">
                Svenska Myndigheter
              </h1>
              <p className="text-slate-400 text-lg">
                Analysverktyg för statsförvaltningen
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12"
            >
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full"
                />
                {/* Shimmer effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>

              {/* Progress text */}
              <div className="flex items-center justify-between mt-4">
                <motion.p
                  key={status}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 text-sm"
                >
                  {status}
                </motion.p>
                <span className="text-primary-400 font-mono text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>

            {/* Data sources attribution */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-16 flex items-center justify-center gap-6 text-slate-500 text-xs"
            >
              <span>Data från ESV</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>SCB</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Wikidata</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
