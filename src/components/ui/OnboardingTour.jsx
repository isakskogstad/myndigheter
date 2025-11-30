import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Sparkles, BarChart3,
  MapPin, Building2, Search, Command, Lightbulb
} from 'lucide-react';

const STORAGE_KEY = 'myndigheter_onboarding_completed';

const tourSteps = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Välkommen till Svenska Myndigheter!',
    description: 'Utforska Sveriges statsförvaltning genom interaktiva visualiseringar och data. Låt oss visa dig runt!',
    image: null
  },
  {
    id: 'dashboard',
    icon: BarChart3,
    title: 'Dashboard med historik',
    description: 'På startsidan kan du se utvecklingen av svenska myndigheter över tid. Zooma in på olika tidsperioder och växla mellan olika mätvärden.',
    highlight: 'overview'
  },
  {
    id: 'map',
    icon: MapPin,
    title: 'Geografisk fördelning',
    description: 'Klicka på "Regioner" för att se en interaktiv karta över var myndigheterna finns. Klicka på ett län för att filtrera.',
    highlight: 'regions'
  },
  {
    id: 'search',
    icon: Search,
    title: 'Sök bland myndigheter',
    description: 'I "Register" kan du söka, filtrera och exportera myndighetslistan. Klicka på en myndighet för att se alla detaljer.',
    highlight: 'list'
  },
  {
    id: 'command',
    icon: Command,
    title: 'Snabbkommandon',
    description: 'Tryck ⌘K (Mac) eller Ctrl+K (Windows) för att öppna snabbsök. Navigera snabbt, växla tema och exportera data.',
    shortcut: true
  },
  {
    id: 'done',
    icon: Lightbulb,
    title: 'Du är redo!',
    description: 'Nu kan du börja utforska. Tips: Håll muspekaren över diagram och element för mer information. Lycka till!',
    final: true
  }
];

/**
 * OnboardingTour Component
 * Guided tour for first-time visitors
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether tour is open
 * @param {function} props.onClose - Close callback
 * @param {function} props.onNavigate - Navigate to view callback (optional)
 */
const OnboardingTour = ({ isOpen, onClose, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-6">
                {tourSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-8 bg-primary-500'
                        : i < currentStep
                          ? 'w-2 bg-primary-300'
                          : 'w-2 bg-slate-200 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Shortcut hint */}
                  {step.shortcut && (
                    <div className="mt-4 flex items-center gap-3">
                      <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        ⌘K
                      </kbd>
                      <span className="text-slate-400 text-sm">eller</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        Ctrl+K
                      </kbd>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              {/* Don't show again checkbox */}
              {isFirst && (
                <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  Visa inte igen
                </label>
              )}
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tillbaka
                </button>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center gap-3">
                {!isLast && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-colors"
                  >
                    Hoppa över
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-md shadow-primary-500/30 transition-all hover:shadow-lg"
                >
                  {isLast ? 'Börja utforska' : 'Nästa'}
                  {!isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook to check if onboarding should be shown
 */
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding before
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay showing tour to let app load
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const openTour = () => setShowTour(true);
  const closeTour = () => setShowTour(false);
  const resetTour = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowTour(true);
  };

  return { showTour, openTour, closeTour, resetTour };
}

export default OnboardingTour;
