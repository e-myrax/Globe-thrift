import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, Shield, Users, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft, Globe } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../../lib/utils';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to Globe Thrift",
    description: "The decentralized protocol for trustless community savings (Ajo/Esusu). Let's get you ready for your first rotation.",
    icon: Globe,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    detail: "Globe Thrift automates the traditional rotating savings model using secure on-chain escrows."
  },
  {
    title: "Protocol Gateway",
    description: "To participate, you'll need a digital wallet. We support Stellar (via Freighter) and EVM chains like Polygon.",
    icon: Wallet,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    detail: "Your wallet is your identity. It's used to sign contributions and receive payouts automatically."
  },
  {
    title: "Create or Join a Circle",
    description: "Circles are smart contracts that manage contributions. You can start your own with custom rules or join an existing community.",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    detail: "Set your contribution amount, rotation frequency, and member capacity when creating a circle."
  },
  {
    title: "The Trust Score",
    description: "Our protocol measures reliability through a dynamic Trust Score. Consistent contributions boost your priority in rotations.",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    detail: "High scores grant access to premium circles and lower collateral requirements."
  }
];

export const OnboardingModal = ({ isOpen, onClose, onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="p-8 sm:p-10 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-3xl bg-[#050508]/95 rounded-[2.5rem]">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-end mb-4">
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center relative">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 relative"
                >
                  <div className={cn("absolute inset-0 blur-2xl opacity-20", step.bg)} />
                  <div className={cn("relative z-10 w-full h-full flex items-center justify-center rounded-3xl border border-white/10 shadow-2xl", step.bg, step.color)}>
                    <step.icon className="w-10 h-10" />
                  </div>
                </motion.div>

                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-4 uppercase italic">
                    {step.title.split(' ')[0]} <span className="text-indigo-400">{step.title.split(' ').slice(1).join(' ')}</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium px-4">
                    {step.description}
                  </p>
                  
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl mb-8 text-left group">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Protocol Note</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                      "{step.detail}"
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <Button 
                    variant="secondary" 
                    onClick={handlePrev}
                    className="flex-shrink-0 w-14 h-14 rounded-2xl border-white/5"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                )}
                <Button 
                  size="lg" 
                  className={cn(
                    "flex-grow h-14 rounded-2xl shadow-xl transition-all group/btn",
                    currentStep === STEPS.length - 1 ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "shadow-indigo-600/20"
                  )}
                  onClick={handleNext}
                >
                  {currentStep === STEPS.length - 1 ? (
                    <span className="flex items-center gap-2">Ready to Enter <CheckCircle2 className="w-5 h-5" /></span>
                  ) : (
                    <span className="flex items-center gap-2">Next Phase <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" /></span>
                  )}
                </Button>
              </div>

              <div className="mt-6 flex justify-center gap-1.5">
                {STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      idx === currentStep ? "w-6 bg-indigo-500" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
