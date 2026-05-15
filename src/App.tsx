import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Plus, 
  Wallet, 
  ArrowRight, 
  TrendingUp, 
  Award,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Globe,
  Zap,
  Activity,
  Layers,
  Lock,
  AlertTriangle,
  Share2,
  Edit2,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { auth, signInWithGoogle } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { Button } from './components/ui/Button';
import { Card, CardTitle, CardDescription } from './components/ui/Card';
import { CreateCircleModal } from './components/ui/CreateCircleModal';
import { cn, formatAddress, formatCurrency } from './lib/utils';
import { ajoService } from './services/ajoService';
import { trustlessWorkService } from './services/trustlessWorkService';
import { WalletValidationGate } from './components/WalletValidationGate';
import { WalletConnectionModal } from './components/ui/WalletConnectionModal';
import { OnboardingModal } from './components/ui/OnboardingModal';
import { AuthModal } from './components/ui/AuthModal';

import { Logo } from './components/Logo';

// --- Mock Data for UI ---
const MOCK_CIRCLES = [
  { id: '1', name: 'Traders Hub', members: 6, contributed: 4, amount: 500, nextPayout: 'June 15', progress: 66, role: 'member', contractAddress: 'vEscrow5V9GZf9gW6GvP9V6GvP9V6GvP9V6GvP9V6GvP', membersCount: 6, maxMembers: 10, status: 'active', contributionAmount: 500, frequency: 'weekly' },
  { id: '2', name: 'Dev Founders', members: 4, contributed: 4, amount: 1000, nextPayout: 'May 30', progress: 100, role: 'organizer', contractAddress: 'vEscrow5V9GZf9gW6GvP9V6GvP9V6GvP9V6GvP9V6GvP', membersCount: 4, maxMembers: 5, status: 'active', contributionAmount: 1000, frequency: 'monthly' },
];

const BackgroundBlobs = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[140px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[140px]" />
    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[100px]" />
  </div>
);

const TrustBar = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="mt-20 border-t border-white/5 pt-12"
  >
    <p className="label-micro text-center mb-8 opacity-50">Trusted by Global Trust Protocols</p>
    <div className="flex flex-wrap justify-center sm:justify-between items-center gap-6 sm:gap-8 px-4 opacity-30 grayscale hover:grayscale-0 transition-all">
      <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tighter shrink-0"><ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /> SENTINEL</div>
      <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tighter shrink-0"><Activity className="w-5 h-5 sm:w-6 sm:h-6" /> FLOW STATE</div>
      <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tighter shrink-0"><Layers className="w-5 h-5 sm:w-6 sm:h-6" /> MERKLE</div>
      <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tighter shrink-0"><Zap className="w-5 h-5 sm:w-6 sm:h-6" /> QUANTUM</div>
      <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tighter shrink-0"><Globe className="w-5 h-5 sm:w-6 sm:h-6" /> TERRA</div>
    </div>
  </motion.div>
);

const VirtualCard = () => (
  <motion.div
    initial={{ x: 40, opacity: 0, rotateY: 20 }}
    animate={{ x: 0, opacity: 1, rotateY: 0 }}
    transition={{ delay: 0.5, duration: 1.2, ease: "circOut" }}
    className="absolute -bottom-10 -left-8 sm:-left-16 z-20 w-64 h-40 sm:w-72 sm:h-44 glass-morphism rounded-3xl p-5 sm:p-6 border-white/20 shadow-2xl backdrop-blur-3xl overflow-hidden group hover:-translate-y-2 transition-transform scale-90 sm:scale-100 origin-bottom-left"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
    <div className="relative h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <CreditCard className="text-white w-5 h-5" />
        </div>
        <div className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Virtual Escrow</div>
      </div>
      
      <div>
        <p className="label-micro !text-slate-500 mb-1">Available Liquidity</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-white">₦4,250,000</h4>
          <span className="text-xs text-emerald-400 font-mono">NGN</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1 opacity-60">
          <h5 className="text-sm font-medium text-slate-300">₦2,150,000</h5>
          <span className="text-[10px] text-slate-500 font-mono uppercase">LOCKED</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-white/30">
        <span>**** 5013</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-indigo-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
        </div>
      </div>
    </div>
  </motion.div>
);

const RotationVisual = () => (
  <div className="relative w-full max-w-[280px] xs:max-w-sm sm:max-w-md lg:max-w-none mx-auto aspect-square flex items-center justify-center">
    {/* Abstract Rotation Circles */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      className="absolute inset-0 border-[1px] border-indigo-500/10 rounded-full"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="absolute inset-8 border-[1px] border-emerald-500/10 rounded-full"
    />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      className="absolute inset-16 border-[1px] border-white/5 rounded-full"
    />

    {/* Focal Points */}
    {[0, 90, 180, 270].map((angle, i) => (
      <motion.div
        key={angle}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: angle 
        }}
        transition={{ 
          delay: i * 0.2, 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute w-full h-full"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full blur-[4px] shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
      </motion.div>
    ))}

    <div className="relative z-10 w-4/5 h-4/5 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/10">
      <img
        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2432&auto=format&fit=crop"
        alt="Product feature"
        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-60" />
    </div>

    <VirtualCard />
  </div>
);

type View = 'overview' | 'marketplace' | 'wallet' | 'business' | 'agents' | 'how-it-works';

const StatsGrid = ({ trustScore }: { trustScore: number }) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
    <Card variant="solid" className="p-5 bg-white/5 border-white/5 backdrop-blur-md">
      <p className="label-micro mb-2">Total Contribution</p>
      <h3 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">{formatCurrency(12500)}</h3>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">+12% this month</span>
      </div>
    </Card>
    <Card variant="solid" className="p-5 bg-white/5 border-white/5 backdrop-blur-md">
      <p className="label-micro mb-2">Active Circles</p>
      <h3 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">3</h3>
      <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Global P2P Rotations</p>
    </Card>
    <Card variant="solid" className="p-5 bg-white/5 border-white/5 backdrop-blur-md xs:col-span-2 md:col-span-1">
      <p className="label-micro mb-2">Social Trust Score</p>
      <h3 className="text-xl sm:text-2xl font-bold text-indigo-400 font-display tracking-tight">{trustScore}</h3>
      <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Verifiable Reputation</p>
    </Card>
  </div>
);

const TimelineCard = ({ user, circles }: { user: any, circles: any[] }) => {
  const [loading, setLoading] = useState(false);
  const activeCircle = circles.find(c => c.status === 'active') || circles[0];

  return (
    <Card className="bg-emerald-500/5 border-emerald-500/10 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/20">
          <Calendar className="w-5 h-5" />
        </div>
        <h4 className="text-base sm:text-lg font-bold font-display tracking-tight text-white uppercase">Payout Schedule</h4>
      </div>
      <div className="space-y-4">
        {activeCircle ? (
          <>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <p className="label-micro !text-emerald-500 mb-1">Your Collection turn</p>
              <p className="text-2xl font-bold text-white font-display">
                {activeCircle.membership?.position || 1} / {activeCircle.maxMembers}
              </p>
              <p className="text-xs text-emerald-400 mt-2 italic font-medium">Estimated: {formatCurrency(activeCircle.contributionAmount * activeCircle.maxMembers)}</p>
            </div>
            <div className="p-5 rounded-2xl border border-dashed border-slate-800 bg-transparent">
              <p className="label-micro mb-1">Next Contribution Due</p>
              <p className="text-lg font-bold text-slate-300 font-display">{activeCircle.frequency} rotation</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Amount: {formatCurrency(activeCircle.contributionAmount)}</p>
            <div className="flex gap-3 mt-6">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-grow py-3 rounded-xl shadow-xl shadow-indigo-600/10"
                  isLoading={loading}
                  onClick={async () => {
                    if (!user?.uid || !activeCircle.id) return;
                    setLoading(true);
                    try {
                      // Phase 2: Update (U) — Funding Phase on Trustless Work
                      await ajoService.recordContribution(
                        activeCircle.id, 
                        user.uid, 
                        activeCircle.contributionAmount, 
                        activeCircle.currentRotation, 
                        `0x${Math.random().toString(16).slice(2)}`
                      );
                      alert('Success! Protocol verified the transaction and funded the escrow milestone.');
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Pay Period
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-4 py-3 rounded-xl border-indigo-500/20 text-indigo-100 hover:bg-indigo-500/10"
                  onClick={async () => {
                    if (!activeCircle.id) return;
                    setLoading(true);
                    try {
                      const data = await ajoService.syncCircleWithOnChainData(activeCircle.id);
                      if (data) alert('Synced with Stellar Indexer API!');
                      else alert('No on-chain data found for this escrow.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Sync <Globe className="ml-1 w-3 h-3" />
                </Button>
              </div>
            </div>
            {/* Escrow Status Section (Read Phase R) */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest text-[11px]">
              <Lock className="w-3 h-3 text-indigo-400" /> Trustless Escrow Status
            </h4>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded-lg text-center">
              {activeCircle.onChainStatus || 'Initiated'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">State</p>
              <p className="text-xs text-white font-mono">{activeCircle.onChainStatus || 'ACTIVE'}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Locked Funds</p>
              <p className="text-xs text-white font-mono">{formatCurrency(activeCircle.totalFunds)}</p>
            </div>
          </div>
          
          {activeCircle.onChainMilestones && (
            <div className="space-y-2 mb-6">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest px-1">Escrow Milestones</p>
              {(activeCircle.onChainMilestones as any[]).map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-300 font-medium">Rotation {i + 1}</span>
                  <span className={cn(
                    "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                    m.status === 'released' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/10 text-slate-500"
                  )}>{m.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeCircle.role === 'organizer' && activeCircle.totalFunds >= activeCircle.contributionAmount && (
            <div className="flex flex-col gap-2 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-indigo-500/30 text-indigo-100 hover:bg-indigo-500/10 py-4"
                isLoading={loading}
                onClick={async () => {
                  if (confirm('Release payout to recipient? This triggers the Trustless Work Execute Phase (D).')) {
                    setLoading(true);
                    try {
                      await ajoService.releasePayout(activeCircle.id, user.uid);
                      alert('Payout released via Stellar (Soroban) Escrow!');
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              >
                Release Milestone <Zap className="ml-2 w-4 h-4 text-amber-400" />
              </Button>
              <button 
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase font-bold tracking-widest text-center mt-2"
                onClick={async () => {
                  const reason = prompt('Reason for dispute:');
                  if (reason && activeCircle.twEscrowId) {
                    await trustlessWorkService.initiateDispute(activeCircle.twEscrowId, reason);
                    alert('Dispute initiated. Protocol resolvers notified.');
                  }
                }}
              >
                Report Dispute / Issue
              </button>
            </div>
          )}
        </div>
      </>
        ) : (
          <div className="text-center py-10 opacity-30">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xs uppercase font-bold tracking-widest">No Active Circles</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const ActivityLog = () => (
  <Card variant="solid" className="bg-white/5 border-white/10 p-5 sm:p-6 flex-grow">
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-900/20">
        <Clock className="w-5 h-5" />
      </div>
      <h4 className="text-base sm:text-lg font-bold font-display tracking-tight text-white uppercase">Activity Log</h4>
    </div>
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 items-start group">
          <div className="w-1 h-10 bg-indigo-500/50 rounded-full group-hover:bg-indigo-400 transition-colors" />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Contribution Verified</p>
            <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
              {i === 1 ? 'Me' : `0x${Math.random().toString(16).slice(2, 6)}...`} committed {formatCurrency(2000)} to rotation.
            </p>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {i * 12} mins ago
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-8 pt-8 border-t border-white/5">
      <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-500/10 text-center">
        <p className="text-[11px] text-indigo-300 font-medium">Emergency Swap Required?</p>
        <button className="text-[10px] font-bold text-white uppercase tracking-[0.1em] mt-2 hover:text-indigo-300 transition-colors underline underline-offset-4">
          Request Rotation Shift →
        </button>
      </div>
    </div>
  </Card>
);

const MarketplaceView = ({ circles, onJoin }: { circles: any[], onJoin: (circleId: string) => void }) => {
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [freqFilter, setFreqFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const filteredCircles = React.useMemo(() => {
    let result = [...(circles || [])];

    // Search
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Frequency
    if (freqFilter !== 'all') {
      result = result.filter(c => c.frequency === freqFilter);
    }

    // Status
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'amount-high':
          return b.contributionAmount - a.contributionAmount;
        case 'amount-low':
          return a.contributionAmount - b.contributionAmount;
        case 'slots':
          return (b.maxMembers - (b.membersCount || 0)) - (a.maxMembers - (a.membersCount || 0));
        case 'newest':
        default:
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return result;
  }, [circles, searchQuery, freqFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white uppercase italic">
            Global <span className="text-gradient">Marketplace</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-lg font-medium leading-relaxed">
            Discover peer-to-peer savings protocols across jurisdictions. 
            Automated trust, verifiable participation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-grow sm:flex-grow-0 sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search circles, protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-600"
            />
          </div>
          <Button 
            variant="outline" 
            className={cn(
              "rounded-2xl gap-2 h-[58px] px-6 border-white/10",
              isFilterVisible && "bg-indigo-500/10 border-indigo-500/30 text-white"
            )}
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <Filter className="w-4 h-4" />
            Filters
            { (freqFilter !== 'all' || statusFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)] ml-1" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isFilterVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card variant="solid" className="p-6 bg-white/[0.03] border-white/5 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="label-micro block mb-3 opacity-50">Settlement Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'weekly', 'bi-weekly', 'monthly'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFreqFilter(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                        freqFilter === f 
                          ? "bg-indigo-500 border-indigo-400 text-white" 
                          : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-micro block mb-3 opacity-50">Protocol Status</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'active'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                        statusFilter === s 
                          ? "bg-emerald-500 border-emerald-400 text-white" 
                          : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-micro block mb-3 opacity-50">Sort Ordering</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 appearance-none bg-transparent"
                  >
                    <option value="newest" className="bg-[#0a0a0f]">Newest Protocol</option>
                    <option value="amount-high" className="bg-[#0a0a0f]">Amount: High to Low</option>
                    <option value="amount-low" className="bg-[#0a0a0f]">Amount: Low to High</option>
                    <option value="slots" className="bg-[#0a0a0f]">Availability: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCircles.map(circle => (
          <Card key={circle.id} variant="glass" hoverable className="p-8 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe className="w-20 h-20 text-indigo-400 -mr-8 -mt-8" />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/20">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="label-micro !text-slate-500 text-[9px]">Potential Payout</p>
                <p className="text-xl font-bold text-white font-mono">{formatCurrency(circle.contributionAmount * circle.maxMembers)}</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-tight text-balance">{circle.name}</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 h-12 line-clamp-2 opacity-80">{circle.description || 'Public rotation group for verified members.'}</p>
            
            <div className="space-y-4 pt-6 border-t border-white/5 relative">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 uppercase tracking-widest font-bold">Contribution</span>
                <div className="text-right">
                  <span className="text-indigo-400 font-mono font-bold block">{formatCurrency(circle.contributionAmount)}</span>
                  <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">{circle.frequency}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 uppercase tracking-widest font-bold">Liquidity Status</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest",
                  circle.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 text-[8px]"
                )}>
                  {circle.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] mb-4">
                <span className="text-slate-500 uppercase tracking-widest font-bold">Protocol Access</span>
                <span className="text-white font-bold">{circle.maxMembers - (circle.membersCount || 0)} / {circle.maxMembers} Open Slots</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mb-4">
                <span className="text-slate-500 uppercase tracking-widest font-bold">Settlement Layer</span>
                <span className="text-indigo-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                  <Globe className="w-3 h-3" /> {circle.network?.split('-')[0] || 'stellar'}
                </span>
              </div>

              <div className="pt-2">
                <Button 
                  variant="primary" 
                  className="w-full h-14 rounded-2xl shadow-xl shadow-indigo-600/10 group/btn"
                  isLoading={joiningId === circle.id}
                  onClick={async () => {
                    setJoiningId(circle.id);
                    try {
                      await onJoin(circle.id);
                    } finally {
                      setJoiningId(null);
                    }
                  }}
                >
                  Join Rotation <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredCircles.length === 0 && (circles || []).length > 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
             <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching protocols found</p>
          </div>
        )}
        {(circles || []).length === 0 && [1,2,3].map(i => (
          <Card key={i} variant="glass" className="p-8 opacity-40 grayscale pointer-events-none">
            <div className="h-6 w-32 bg-slate-800 rounded mb-4" />
            <div className="h-20 w-full bg-slate-800 rounded mb-4" />
            <div className="h-10 w-full bg-slate-800 rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
};

const WalletView = ({ profile }: { profile: any }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newWallet, setNewWallet] = useState(profile?.walletAddress || '');

  const handleUpdateWallet = async () => {
    if (!profile?.uid) return;
    setIsUpdating(true);
    try {
      await ajoService.updateUserProfile(profile.uid, { walletAddress: newWallet });
      alert('Wallet address updated protocol-wide.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition" />
          <div className="relative pt-44">
             <VirtualCard />
          </div>
        </div>
        
        <Card variant="solid" className="p-8 bg-white/5 border-white/10">
          <h4 className="label-micro mb-6">Linked Protocol Wallet</h4>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-2">Stellar / Trustless Work Address</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newWallet}
                  onChange={(e) => setNewWallet(e.target.value)}
                  placeholder="G... or 0x..."
                  className="flex-grow bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500/50"
                />
                <Button 
                  size="sm" 
                  onClick={handleUpdateWallet} 
                  isLoading={isUpdating}
                  className="px-4"
                >
                  Save
                </Button>
              </div>
              <p className="text-[9px] text-slate-500 mt-2 italic">* This address is used for all on-chain escrow interactions.</p>
            </div>
            
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">United Bank of Africa</p>
                  <p className="text-[10px] text-slate-500">**** 8820</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
            <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest h-12 rounded-xl">Add Bank Account</Button>
          </div>
        </Card>

        <WalletValidationGate address={profile?.walletAddress} />
      </div>

      <div className="lg:col-span-8">
        <Card variant="glass" className="p-5 sm:p-8 h-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Transaction Flow</h2>
              <p className="label-micro !text-slate-500 mt-1">Escrow & Payout history</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="rounded-lg flex-1 sm:flex-none h-10 sm:h-9">Export CSV</Button>
              <Button variant="outline" size="sm" className="rounded-lg flex-1 sm:flex-none h-10 sm:h-9">Filter</Button>
            </div>
          </div>

          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    i % 2 === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                  )}>
                    {i % 2 === 0 ? <Plus className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{i % 2 === 0 ? 'Lump Sum Payout' : 'Weekly Contribution'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Traders Hub Elite • May {10 + i}, 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    i % 2 === 0 ? "text-emerald-400" : "text-white"
                  )}>{i % 2 === 0 ? '+' : '-'}{formatCurrency(2000 * (i % 2 === 0 ? 5 : 1))}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Confirmed</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const BusinessView = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
    <div>
      <span className="label-micro !text-indigo-400 mb-4 block">B2B Solutions</span>
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white mb-6 leading-tight">Automate Payroll & <span className="text-gradient">Thrift Benefits</span>.</h2>
      <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
        Empower your employees with automated rotating credit. No interest, no debt traps—just community-powered liquidity integrated directly via API.
      </p>
      
      <div className="space-y-6 mb-12">
        <div className="flex items-start gap-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-white font-bold">Programmable Paydays</h4>
            <p className="text-sm text-slate-500">Route a fraction of payroll to employee Ajo circles automatically.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-white font-bold">Risk Management Portal</h4>
            <p className="text-sm text-slate-500">Real-time trust scores and contribution tracking for HR teams.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button size="lg" className="px-8 rounded-2xl">Contact Sales</Button>
        <Button variant="outline" size="lg" className="px-8 rounded-2xl">Developer Docs</Button>
      </div>
    </div>

    <div className="relative">
      <div className="absolute inset-0 bg-indigo-600/20 blur-[120px] rounded-full" />
      <Card variant="glass" className="p-4 relative">
        <div className="bg-[#050508] rounded-2xl p-6 font-mono text-[11px] text-slate-400 leading-relaxed shadow-inner border border-white/5">
          <p className="text-indigo-400 mb-2">// Initialize Corporate Circle API</p>
          <p><span className="text-emerald-400">const</span> globe = <span className="text-emerald-400">new</span> GlobeProtocol({'{'}</p>
          <p className="pl-4">apiKey: <span className="text-amber-400">'globe_8820_safe'</span>,</p>
          <p className="pl-4">mode: <span className="text-amber-400">'batch_payroll'</span></p>
          <p>{'}'});</p>
          <br/>
          <p><span className="text-indigo-400">await</span> globe.deployCircle({'{'}</p>
          <p className="pl-4 text-slate-500">name: <span className="text-amber-400">'Eng Team Monthly'</span>,</p>
          <p className="pl-4 text-slate-500">amount: 2500,</p>
          <p className="pl-4 text-slate-500">membersCount: 12</p>
          <p>{'});'}</p>
        </div>
      </Card>
    </div>
  </div>
);

const HowItWorksView = () => (
  <div className="max-w-4xl mx-auto space-y-12 sm:space-y-20">
    <div className="text-center">
      <h2 className="text-3xl sm:text-5xl font-bold font-display text-white mb-4">How the Protocol <span className="text-gradient">Operates</span></h2>
      <p className="text-slate-400 text-sm sm:text-base px-4">Four steps to decentralized financial freedom.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-0">
      {[
        { step: '01', title: 'Connect Identity', desc: 'Securely link your Web3 wallet and verify your digital trust score.', icon: ShieldCheck },
        { step: '02', title: 'Join a Rotation', desc: 'Select a circle that matches your financial goals and contribution capacity.', icon: Plus },
        { step: '03', title: 'Smart Escrow', desc: 'Funds are locked in a non-custodial contract, executed only on rotation completion.', icon: Layers },
        { step: '04', title: 'Lump Sum Payout', desc: 'Receive the full collective amount on your turn, interest-free.', icon: Award },
      ].map((item, i) => (
        <Card key={i} variant="glass" className="p-6 sm:p-8 group relative overflow-hidden">
          <span className="absolute -top-4 -right-4 text-7xl sm:text-9xl font-bold text-white/[0.02] pointer-events-none group-hover:text-indigo-500/5 transition-all">{item.step}</span>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 sm:mb-6 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500 transition-colors group-hover:text-white">
            <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 font-display">{item.title}</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
        </Card>
      ))}
    </div>
  </div>
);

const FeatureIcon = ({ icon: Icon, color }: { icon: any, color: string }) => (
  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-xl", color)}>
    <Icon className="w-6 h-6" />
  </div>
);

const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="relative isolate min-h-screen pb-20">
      <BackgroundBlobs />
      
      {/* Hero Section */}
      <section className="pt-10 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-center">
            <div className="max-w-2xl lg:mx-0 text-center lg:text-left flex flex-col items-center lg:items-start">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 sm:mb-10"
              >
                <Logo>
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] text-slate-500 mt-1 font-medium">
                    Powered by <a href="https://www.trustlesswork.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Trustless Work</a>
                  </p>
                </Logo>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-4xl xs:text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl font-display leading-[1.1] sm:leading-[0.85] mb-6"
              >
                The Future of <span className="text-gradient">Social Capital</span>.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 sm:mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-slate-400 max-w-lg font-medium"
              >
                Automate your Ajo circles with programmable escrow. Transparent, non-custodial, and code-enforced financial collaboration for the next billion users.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full"
              >
                <Button size="lg" onClick={onGetStarted} className="px-10 sm:px-12 h-14 sm:h-16 text-lg sm:text-xl rounded-2xl shadow-2xl shadow-indigo-600/20 group justify-center w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center gap-4 px-5 sm:px-6 h-14 sm:h-16 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl w-full sm:w-auto justify-center">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050508] bg-slate-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">4.2k+ Active Users</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Current TVL: $2.4M</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-20 lg:mt-0 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="relative z-10"
              >
                <RotationVisual />
              </motion.div>
            </div>
          </div>

          <TrustBar />
        </div>
      </section>

      {/* Corporate Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-indigo-600/20 blur-[80px] sm:blur-[120px] rounded-full" />
              <Card variant="glass" className="p-5 sm:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                  <Layers className="w-32 h-32 text-indigo-400" />
                </div>
                <div className="bg-[#050508] rounded-2xl p-4 sm:p-6 font-mono text-[10px] sm:text-xs text-slate-400 leading-relaxed shadow-inner border border-white/5 overflow-x-auto whitespace-pre">
                  <p className="text-indigo-400 mb-2">// Corporate Payroll Integration</p>
                  <p><span className="text-emerald-400">const</span> globe = <span className="text-emerald-400">new</span> GlobeProtocol({'{'}</p>
                  <p className="pl-4">apiKey: <span className="text-amber-400">'globe_corp_8820'</span>,</p>
                  <p className="pl-4">environment: <span className="text-amber-400">'production'</span></p>
                  <p>{'}'});</p>
                  <br/>
                  <p><span className="text-indigo-400">await</span> globe.enablePayrollDeduction({'{'}</p>
                  <p className="pl-4">employeeId: <span className="text-amber-400">'EMP_4420'</span>,</p>
                  <p className="pl-4">circleId: <span className="text-amber-400">'hq_savings_pool'</span>,</p>
                  <p className="pl-4">amountBasis: <span className="text-amber-400">'percentage'</span>,</p>
                  <p className="pl-4">value: 5</p>
                  <p>{'});'}</p>
                </div>
              </Card>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <span className="label-micro !text-indigo-400 block uppercase tracking-[0.3em]">Business Solutions</span>
                <span className="text-[9px] sm:text-[10px] lg:text-[11px] bg-indigo-500/10 text-indigo-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-indigo-500/20 font-bold uppercase tracking-widest">Coming Soon</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white mb-6 sm:mb-8 leading-tight">
                Integrate Ajo into <span className="text-gradient">Corporate Payroll</span>.
              </h2>
              <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-10 leading-relaxed">
                Empower your workforce with automated, non-custodial savings benefits. Globe Protocol integrates directly with existing HR systems to route contributions before they leave the treasury.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
                <div>
                  <h4 className="text-white text-sm sm:text-base font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" /> Auto-Routing
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">Settlements are handled directly at the protocol level, reducing administrative overhead.</p>
                </div>
                <div>
                  <h4 className="text-white text-sm sm:text-base font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">Smart-contract enforced rules ensure parity and safety for all employee contributions.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-xl px-8 sm:px-10 h-14 sm:h-16 text-sm sm:text-base w-full sm:w-auto">Request Enterprise Demo</Button>
                <Button variant="outline" size="lg" className="rounded-xl px-8 sm:px-10 h-14 sm:h-16 text-sm sm:text-base w-full sm:w-auto">Read API docs</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-6xl font-bold font-display text-white">Engineered for <span className="text-gradient">Trust</span>.</h2>
            <p className="mt-4 sm:mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">Social capital is a human right. We build the rails to make it liquid, safe, and verifiable.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card variant="glass" className="p-6 sm:p-10 hover:border-indigo-500/30 transition-all">
              <FeatureIcon icon={ShieldCheck} color="bg-indigo-500/10 text-indigo-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 font-display">Zero Collateral</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Access lump sums based on community trust scores rather than predatory interest rates or assets.</p>
            </Card>
            <Card variant="glass" className="p-6 sm:p-10 hover:border-emerald-500/30 transition-all">
              <FeatureIcon icon={Users} color="bg-emerald-500/10 text-emerald-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 font-display">Social Credit Score</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Build a verifiable history of financial reliability that exists across the decentralized web.</p>
            </Card>
            <Card variant="glass" className="p-6 sm:p-10 hover:border-white/20 transition-all sm:col-span-2 lg:col-span-1">
              <FeatureIcon icon={Layers} color="bg-white/5 text-white" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 font-display">Non-Custodial</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Globe thrift never holds your funds. They stay in a program-locked escrow, governed by the protocol.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-indigo-600/10 blur-[100px] sm:blur-[150px] rounded-full" />
        </div>
        
        <div className="mx-auto max-w-5xl text-center relative z-10 glass-morphism rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-24 border-white/5">
          <h2 className="text-4xl sm:text-7xl font-bold font-display text-white mb-6 sm:mb-8 leading-tight">Ready to build <br className="hidden sm:block" /> your <span className="text-gradient">Circle</span>?</h2>
          <p className="text-slate-400 text-base sm:text-xl mb-8 sm:mb-12 max-w-xl mx-auto">Join thousands of members who are already leveraging the power of collective liquid capital.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button size="lg" onClick={onGetStarted} className="px-10 sm:px-14 h-16 sm:h-18 text-lg sm:text-xl rounded-2xl w-full sm:w-auto">
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" className="px-10 sm:px-14 h-16 sm:h-18 text-lg sm:text-xl rounded-2xl w-full sm:w-auto">
              View Marketplace
            </Button>
          </div>
          <p className="mt-8 sm:mt-12 text-[8px] sm:text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Safe • Transparent • Decentralized</p>
        </div>
      </section>

      <footer className="mt-20 border-t border-white/5 pt-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 mb-12">
        <div className="flex items-center gap-2 font-bold text-white tracking-widest uppercase">
          <Logo showText={false} className="gap-2" />
          <span className="ml-1">Globe thrift</span>
        </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors">
            <a href="#" className="hover:text-white">Docs</a>
            <a href="#" className="hover:text-white">Business</a>
            <a href="#" className="hover:text-white">Security</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
          <div className="text-[10px] font-mono text-center md:text-right">© 2024 GLOBE THRIFT FINANCE. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
};

const AgentsView = () => (
  <div className="max-w-4xl mx-auto space-y-12">
    <div>
      <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white mb-4">Developer <span className="text-gradient">Hub</span></h2>
      <p className="text-slate-400 text-base sm:text-lg">Integrate the Globe Protocol into your workflow using the Trustless Work SDK.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card variant="glass" className="p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 italic">
          <Zap className="w-5 h-5 text-indigo-400" /> System Architecture
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Globe uses a hybrid architecture: Firebase for high-frequency social interactions and Trustless Work for cryptographically-secure escrow.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-slate-400 uppercase font-bold tracking-widest">Database</span>
            <span className="text-indigo-400 font-mono">Firebase Firestore</span>
          </div>
          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-slate-400 uppercase font-bold tracking-widest">Escrow</span>
            <span className="text-indigo-400 font-mono">Trustless Work API</span>
          </div>
          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-slate-400 uppercase font-bold tracking-widest">Settlement</span>
            <span className="text-indigo-400 font-mono">Smart Contracts</span>
          </div>
        </div>
      </Card>

      <Card variant="glass" className="p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 italic">
          <Layers className="w-5 h-5 text-emerald-400" /> API Access Guide
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Visit Trustless Work</p>
              <p className="text-[11px] text-slate-500">Go to <a href="https://www.trustlesswork.com/" target="_blank" className="text-indigo-400 underline">trustlesswork.com</a> and launch the app.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Connect Wallet</p>
              <p className="text-[11px] text-slate-500">Securely sign in using your preferred Solana or EVM wallet.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Generate API Key</p>
              <p className="text-[11px] text-slate-500">Navigate to <b>Settings &gt; Developers</b> and click "Generate New API Key".</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Configure App</p>
              <p className="text-[11px] text-slate-500">Add the key as <code>VITE_TRUSTLESS_WORK_API_KEY</code> in your environment.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card variant="solid" className="p-10 bg-indigo-600/5 border-indigo-500/10">
      <h3 className="text-2xl font-bold text-white mb-6 font-display">Deep Documentation</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <a href="https://docs.trustlesswork.com/trustless-work" target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-[#050508] border border-white/5 hover:border-indigo-400 transition-all group">
          <h4 className="text-white font-bold mb-2 flex justify-between">Trustless Work Docs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></h4>
          <p className="text-xs text-slate-500">Learn about cross-chain escrows, task management, and cryptographic payments.</p>
        </a>
        <div className="p-6 rounded-2xl bg-[#050508] border border-white/5 hover:border-emerald-400 transition-all group">
          <h4 className="text-white font-bold mb-2 flex justify-between uppercase tracking-widest text-[11px]">Public Chain Discovery <Globe className="w-4 h-4 text-emerald-400" /></h4>
          <p className="text-[10px] text-slate-500 mb-4 leading-relaxed italic">
            The Trustless Work API provides a <code>/networks</code> endpoint to discover supported public chains (Solana, Base, Polygon). 
            Globe uses this to determine the optimal settlement layer.
          </p>
          <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[9px] text-emerald-300">
            GET /v1/networks
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const UserDashboard = (props: { user: any }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <UserDashboardContent {...props} />;
};

const UserDashboardContent = ({ user }: { user: any }) => {
  const [activeView, setActiveView] = useState<View>('overview');
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [editingCircle, setEditingCircle] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  
  const [circles, setCircles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [communityCircles, setCommunityCircles] = useState<any[]>([]);

  const [twNetworks, setTwNetworks] = useState<any[]>([]);
  const [isTwConnected, setIsTwConnected] = useState(false);

  const [inviteId, setInviteId] = useState<string | null>(null);
  const [inviteCircle, setInviteCircle] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inv = params.get('invite');
    if (inv) {
      setInviteId(inv);
      ajoService.getCircle(inv).then(setInviteCircle);
    }
  }, []);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (circleId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?invite=${circleId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(circleId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (circleId: string) => {
    if (confirm('Are you sure you want to archive this circle?')) {
      await ajoService.deleteCircle(circleId);
      alert('Circle archived.');
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      ajoService.syncProfile(user);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      const unsubscribeCircles = ajoService.onUserCircles(user.uid, (data) => {
        setTimeout(() => setCircles(data), 0);
      });
      const unsubscribeProfile = ajoService.onUserProfile(user.uid, (data) => {
        setTimeout(() => setProfile(data), 0);
      });

      return () => {
        unsubscribeCircles();
        unsubscribeProfile();
      };
    }
  }, [user?.uid]);

  useEffect(() => {
    if (inviteId && circles.length > 0) {
      const isAlreadyMember = circles.some(c => c.id === inviteId);
      if (isAlreadyMember) {
        setInviteId(null);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [inviteId, circles.length]);

  useEffect(() => {
    if (profile && profile.onboardingCompleted === undefined) {
      setIsOnboardingOpen(true);
    }
  }, [profile?.onboardingCompleted]);

  const handleOnboardingComplete = () => {
    if (user) {
      ajoService.markOnboardingCompleted(user.uid);
      setIsOnboardingOpen(false);
    }
  };

  const trustScore = profile?.trustScore || 100;
  const [walletReadiness, setWalletReadiness] = useState<any>(null);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const networks = await trustlessWorkService.getNetworks();
        setTwNetworks(networks);
        setIsTwConnected(networks.length > 0);
      } catch (e) {
        console.error('Failed to fetch networks:', e);
      }
    };
    fetchNetworks();
  }, []);

  const handleWalletValidated = React.useCallback((status: any) => {
    setTimeout(() => setWalletReadiness(status), 0);
  }, []);

  const activeNetwork = twNetworks[0]?.name || 'Local Gateway';

  useEffect(() => {
    const unsubCommunity = ajoService.onCommunityCircles((data) => {
      setTimeout(() => setCommunityCircles(data), 0);
    });
    return () => unsubCommunity();
  }, []);

  const handleJoinCircle = async (circleId: string) => {
    if (!user?.uid) return;
    try {
      await ajoService.joinCircle(circleId, user.uid);
      alert('Joined circle successfully!');
      setActiveView('overview');
      setInviteId(null);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e: any) {
      alert(e.message || 'Failed to join circle.');
    }
  };

  const activeCircles = circles.length > 0 ? circles : [];

  const renderContent = () => {
    if (inviteId && inviteCircle) {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <Card variant="glass" className="p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto mb-8 shadow-2xl shadow-indigo-600/20 ring-1 ring-indigo-500/20">
              <Plus className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 font-display">Special Invitation</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
              You've been invited to join <span className="text-white font-bold">{inviteCircle.name}</span>.
              This circle uses <span className="text-indigo-400 font-mono">Globe Protocol</span> for automated trustless payouts.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-10 text-left">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-colors">
                <p className="label-micro !text-indigo-400/60 mb-1">Rotational Deposit</p>
                <p className="text-xl font-bold text-white font-mono">{formatCurrency(inviteCircle.contributionAmount)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-colors">
                <p className="label-micro !text-indigo-400/60 mb-1">Frequency</p>
                <p className="text-xl font-bold text-white uppercase tracking-widest text-[10px] sm:text-xs mt-1">{inviteCircle.frequency}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-colors">
                <p className="label-micro !text-emerald-400/60 mb-1">Total Pool Payout</p>
                <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(inviteCircle.contributionAmount * inviteCircle.maxMembers)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-colors">
                <p className="label-micro !text-indigo-400/60 mb-1">Availability</p>
                <p className="text-xl font-bold text-white tracking-widest">{inviteCircle.membersCount || 0} / {inviteCircle.maxMembers}</p>
              </div>
            </div>

            {user ? (
              <div className="flex flex-col gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full py-6 rounded-2xl shadow-2xl shadow-indigo-600/30 text-lg"
                  onClick={() => handleJoinCircle(inviteCircle.id)}
                >
                  Accept & Activate Protocol
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-slate-500 hover:text-white"
                  onClick={() => {
                    setInviteId(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                >
                  Decline Invitation
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-bold uppercase tracking-widest">
                  Authentication Required to Join Circle
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full py-6 rounded-2xl"
                  onClick={() => signInWithGoogle()}
                >
                  Sign in with Google to Accept
                </Button>
              </div>
            )}
          </Card>
        </div>
      );
    }

    switch (activeView) {
      case 'marketplace':
        return <MarketplaceView circles={communityCircles} onJoin={handleJoinCircle} />;
      case 'wallet':
        return <WalletView profile={profile} />;
      case 'business':
        return <BusinessView />;
      case 'agents':
        return <AgentsView />;
      case 'how-it-works':
        return <HowItWorksView />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              {isConnected && (
                <WalletValidationGate 
                  address={address} 
                  onValidated={handleWalletValidated} 
                />
              )}
              
              {isConnected && walletReadiness && walletReadiness.ok && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest text-[10px]">Stellar (Soroban) Protocol Ready</p>
                      <p className="text-xs text-emerald-500/60 font-mono">XLM: Active | USDC Trustline: Verified</p>
                    </div>
                  </div>
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[7px] font-bold text-emerald-400">✓</div>)}
                  </div>
                </div>
              )}

              <StatsGrid trustScore={trustScore} />
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-3xl font-bold font-display tracking-tight">Your Circles</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Ongoing rotations & state</p>
                  </div>
                  <Button size="sm" className="gap-2 rounded-xl" onClick={() => { setEditingCircle(null); setIsCircleModalOpen(true); }}>
                    <Plus className="w-4 h-4" /> New Circle
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {activeCircles.map((circle) => (
                    <Card key={circle.id} variant="glass" hoverable className="relative overflow-hidden group p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-4 mb-6 sm:mb-8">
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-light italic text-white font-serif mb-2 leading-tight">{circle.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                              <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-400" /> {circle.membersCount || 0} / {circle.maxMembers} Members
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                              <DollarSign className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" /> {formatCurrency(circle.contributionAmount)} / {circle.frequency}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                              <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-400" /> {circle.network?.split('-')[0] || 'stellar'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto shrink-0">
                          <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                             <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleShare(circle.id); }}
                                className={cn(
                                  "p-2 rounded-lg border transition-all flex items-center justify-center",
                                  copiedId === circle.id 
                                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                )}
                                title={copiedId === circle.id ? "Copied!" : "Share Invite Link"}
                              >
                                {copiedId === circle.id ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                              </button>
                              {circle.organizerId === user.uid && (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingCircle(circle); setIsCircleModalOpen(true); }}
                                    className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all"
                                    title="Edit Circle"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(circle.id); }}
                                    className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                                    title="Archive Circle"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                             </div>
                            <div className="text-left sm:text-right">
                              <p className="text-[14px] sm:text-2xl font-mono text-white tracking-tighter">{formatCurrency(circle.contributionAmount * circle.maxMembers)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Cycle Progress</span>
                            <span className="text-sm text-indigo-400 font-mono italic">{Math.round(((circle.membersCount || 0) / (circle.maxMembers || 5)) * 100)}%</span>
                          </div>
                          <div className="h-4 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5 p-[2px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((circle.membersCount || 0) / (circle.maxMembers || 5)) * 100}%` }}
                              transition={{ duration: 1.2, ease: 'circOut' }}
                              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-4">
                          <div className="flex items-center gap-4 text-slate-400">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Status: <span className="text-indigo-400">{circle.status}</span></span>
                          </div>
                          <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform uppercase tracking-widest font-bold text-[10px]">
                            View Protocol details <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {circles.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
                      <Users className="w-16 h-16 mx-auto mb-6 text-slate-600" />
                      <p className="text-lg font-bold text-white font-display mb-2">No Active Savings Circles</p>
                      <p className="text-xs uppercase tracking-[0.2em]">Join the marketplace or create your own</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-8">
              <TimelineCard user={user} circles={circles} />
              <ActivityLog />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-4 sm:py-6 max-w-[1400px] mx-auto relative">
      <BackgroundBlobs />
      <CreateCircleModal 
        isOpen={isCircleModalOpen} 
        onClose={() => { setIsCircleModalOpen(false); setEditingCircle(null); }} 
        circle={editingCircle}
      />
      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={(networkId) => setSelectedNetworkId(networkId)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
      
      <header className="flex items-center justify-between glass p-2 sm:p-4 mb-6 sm:mb-8 rounded-2xl z-20 sticky top-4 sm:top-6 bg-[#050508]/40 backdrop-blur-2xl border-white/5 shadow-2xl">
        <div className="flex items-center gap-1 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveView('overview')}>
          <Logo />
        </div>

        <nav className="flex gap-1 sm:gap-6 lg:gap-8 items-center px-1 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'overview', label: 'Home' },
            { id: 'marketplace', label: 'Market' },
            { id: 'wallet', label: 'Wallet' },
            { id: 'business', label: 'B2B', desktopOnly: true },
            { id: 'agents', label: 'Devs', desktopOnly: true }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all relative py-2 whitespace-nowrap",
                activeView === item.id ? "text-white" : "text-slate-500 hover:text-white",
                item.desktopOnly && "hidden sm:block"
              )}
            >
              {item.label}
              {activeView === item.id && (
                <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden xs:flex flex-col items-end mr-1">
            <span className="label-micro !text-slate-500">Service Status</span>
            <div className="flex items-center gap-1.5">
               <span className={cn(
                 "text-[8px] font-bold uppercase tracking-widest",
                 isOffline ? "text-amber-500" : "text-emerald-500"
               )}>
                 {isOffline ? 'Sync Paused' : 'Synced'}
               </span>
               <div className={cn(
                 "w-1 h-1 rounded-full",
                 isOffline ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
               )} />
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="label-micro !text-slate-500">Status</span>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest",
              isConnecting ? "text-amber-400" : isConnected ? "text-emerald-400" : "text-slate-500"
            )}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          {isConnected ? (
            <Button variant="ghost" size="sm" onClick={() => disconnect()} className="rounded-xl bg-white/5 hover:bg-white/10 flex h-8 sm:h-9 text-[9px] sm:text-[10px] px-2 sm:px-4">
              <span className="hidden xs:inline">{formatAddress(address)}</span>
              <span className="xs:hidden">{address?.slice(0,4)}...</span>
              <LogOut className="ml-1 sm:ml-2 w-3 h-3" />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsWalletModalOpen(true)} className="rounded-xl flex h-8 sm:h-9 text-[9px] sm:text-[10px] px-3 sm:px-4">
              Connect
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOnboardingOpen(true)} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group p-0"
            title="Help & Tutorial"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Button>
          <button onClick={() => auth.signOut()} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center relative group">
            {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-600 rounded-full border border-slate-900 flex items-center justify-center text-[7px] font-bold text-white shadow-lg">
              {trustScore}
            </div>
          </button>
        </div>
      </header>

      <main className="z-0 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};


export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden">
        <BackgroundBlobs />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-6"
        >
          <Logo showText={false} iconClassName="w-20 h-20 shadow-indigo-500/20 ring-1 ring-white/20" />
          <p className="label-micro !text-indigo-400">Globe Thrift: Synchronizing Protocol State</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onGetStarted={() => setIsAuthModalOpen(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <UserDashboard user={user} />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />
      
      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={() => {}} 
      />
    </div>
  );
}
