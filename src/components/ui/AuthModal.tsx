import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ArrowRight, 
  X, 
  Wallet, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  Lock,
  UserCircle
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { signInWithGoogle } from '../../lib/firebase';
import { useStellarWallet } from '../../hooks/useStellarWallet';

interface AuthModalProps {
  isOpen: boolean;
  onClose: boolean | any;
  onOpenWalletModal: () => void;
}

export const AuthModal = ({ isOpen, onClose, onOpenWalletModal }: AuthModalProps) => {
  const { handleConnect } = useStellarWallet();

  const handleStellarConnect = async () => {
    await handleConnect();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose()}
            className="absolute inset-0 bg-[#050508]/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg z-10"
          >
            <Card variant="glass" className="p-6 sm:p-12 border-white/10 relative overflow-hidden">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -ml-32 -mb-32 rounded-full" />

              <button 
                onClick={() => onClose()}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-10 relative">
                <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/20 ring-1 ring-indigo-500/20">
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3 font-display tracking-tight">Access Protocol</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                   Choose your gateway to the Globe Thrift decentralized savings network.
                </p>
              </div>

              <div className="space-y-4 relative">
                {/* Stellar Wallet */}
                <button
                  onClick={handleStellarConnect}
                  className="w-full group flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-indigo-500/20 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm">Connect Stellar Wallet</p>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ring-1 ring-emerald-500/30">Native Support</span>
                    </div>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-0.5">Freighter & Albedo Modules</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-600 group-hover:text-indigo-400 transition-colors" />
                </button>

                <div className="pt-4 flex items-center gap-3 justify-center">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest text-center italic">End-to-End Encrypted Handshake</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
