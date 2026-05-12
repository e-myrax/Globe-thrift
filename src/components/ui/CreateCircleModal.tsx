import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Users, DollarSign, Calendar } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { ajoService } from '../../services/ajoService';
import { auth } from '../../lib/firebase';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCircleModal = ({ isOpen, onClose }: CreateCircleModalProps) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly'>('monthly');
  const [maxMembers, setMaxMembers] = useState('5');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      await ajoService.createCircle({
        name,
        contributionAmount: Number(amount),
        frequency,
        maxMembers: Number(maxMembers),
        organizerId: auth.currentUser.uid,
        description: `Community thrift circle for ${name}`,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="p-10 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-white/10 backdrop-blur-3xl bg-[#050508]/90">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/10 blur-[100px] rounded-full" />
              
              <div className="flex justify-between items-center mb-10 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-500/20">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display tracking-tight text-white uppercase">New Circle</h2>
                    <p className="label-micro !text-indigo-400">Initialize Savings Protocol</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative">
                <div>
                  <label className="label-micro mb-3 block">Protocol Identifier (Name)</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Traders Hub Elite"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-medium placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="label-micro mb-3 block">Contribution (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
                      <input
                        required
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="500"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-micro mb-3 block">Max Capacity</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
                      <input
                        required
                        type="number"
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        placeholder="10"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label-micro mb-3 block">Rotation Cycle</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['weekly', 'bi-weekly', 'monthly'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f as any)}
                        className={cn(
                          "py-3 px-1 text-[10px] font-bold uppercase tracking-widest rounded-xl border transition-all",
                          frequency === f 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40" 
                            : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" isLoading={isLoading} className="w-full py-5 text-lg rounded-2xl shadow-2xl shadow-indigo-600/20">
                    Deploy Smart Contract
                  </Button>
                  <p className="text-[10px] text-center text-slate-500 mt-6 leading-relaxed font-bold uppercase tracking-widest px-8">
                    By initializing, you commit to the <span className="text-indigo-400">JEXAIL decentralized protocol</span>. State changes are permanent.
                  </p>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
