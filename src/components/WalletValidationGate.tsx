import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, ExternalLink, CheckCircle2 } from 'lucide-react';
import { trustlessWorkService } from '../services/trustlessWorkService';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface WalletValidationGateProps {
  address: string | undefined;
  onValidated?: (status: any) => void;
}

export const WalletValidationGate: React.FC<WalletValidationGateProps> = ({ address, onValidated }) => {
  const [status, setStatus] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const checkReadiness = async () => {
    if (!address) return;
    setIsValidating(true);
    try {
      const result = await trustlessWorkService.validateWalletReadiness(address);
      setTimeout(() => {
        setStatus(result);
        if (result.ok && onValidated) {
          onValidated(result);
        }
      }, 0);
    } finally {
      setTimeout(() => setIsValidating(false), 0);
    }
  };

  useEffect(() => {
    if (address) {
      checkReadiness();
    }
  }, [address]);

  if (!address) {
    return (
      <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center">
        <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-50" />
        <h3 className="text-white font-bold mb-1">Stellar Protocol Gate</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">Please connect your Stellar-compatible wallet to begin the on-chain verification process.</p>
      </div>
    );
  }

  const steps = [
    {
      id: 'connection',
      label: 'Network Connection',
      description: 'Connected to Stellar Mainnet',
      isDone: !!address,
    },
    {
      id: 'xlm',
      label: 'Account Activation',
      description: 'Minimum 1 XLM required for network fees',
      isDone: status?.active,
      error: status && !status.active ? 'Account not found on Stellar' : null,
      fixUrl: 'https://www.stellar.org/lumens',
    },
    {
      id: 'usdc',
      label: 'USDC Trustline',
      description: 'Required to receive and hold stable payments',
      isDone: status?.usdcTrustline,
      error: status && !status.usdcTrustline ? 'USDC trustline missing' : null,
      fixUrl: 'https://docs.trustlesswork.com/trustless-work/wallets/usdc-trustline',
    }
  ];

  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Protocol Readiness</h3>
            <p className="text-[10px] text-slate-500 font-mono">{address.slice(0, 6)}...{address.slice(-4)}</p>
          </div>
        </div>
        <button 
          onClick={checkReadiness}
          disabled={isValidating}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", isValidating && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className={cn(
            "p-4 rounded-xl border transition-all",
            step.isDone 
              ? "bg-emerald-500/5 border-emerald-500/20" 
              : "bg-white/5 border-white/10"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className={cn(
                  "mt-0.5",
                  step.isDone ? "text-emerald-400" : "text-slate-500"
                )}>
                  {step.isDone ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-30" />}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-bold mb-0.5",
                    step.isDone ? "text-emerald-100" : "text-slate-400"
                  )}>{step.label}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
              
              {!step.isDone && step.fixUrl && (
                <a 
                  href={step.fixUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wider"
                >
                  Setup <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {status && !status.ok && (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-amber-100 uppercase tracking-widest mb-1">Action Required</p>
            <p className="text-[10px] text-amber-200/70 leading-relaxed">
              {status.message || 'Your wallet is not fully prepared for the Trustless Work protocol. Please fund with XLM and enable the USDC trustline.'}
            </p>
          </div>
        </div>
      )}

      {status?.ok && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            Protocol Verified & Ready
          </p>
        </div>
      )}
    </div>
  );
};
