import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, Globe, Shield, ArrowRight, Check } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { useConnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (networkId: string) => void;
}

const SUPPORTED_NETWORKS = [
  { 
    id: 'stellar-mainnet', 
    name: 'Stellar Protocol', 
    icon: Globe, 
    type: 'Escrow-Optimized', 
    color: 'text-white', 
    bg: 'bg-white/10',
    description: 'Ultra-low fees, near-instant settlement.'
  },
  { 
    id: 'polygon-mainnet', 
    name: 'Polygon PoS', 
    icon: Shield, 
    type: 'EVM Layer-2', 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10',
    description: 'Broadest utility and asset compatibility.'
  },
  { 
    id: 'solana-mainnet', 
    name: 'Solana Network', 
    icon: Wallet, 
    type: 'High Performance', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10',
    description: 'Maximum scalability for high-load circles.'
  }
];

export const WalletConnectionModal = ({ isOpen, onClose, onConnect }: WalletConnectionModalProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const { connectAsync, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isWalletMissing, setIsWalletMissing] = useState(false);

  const checkWalletAvailability = () => {
    setConnectionError(null);
    setIsWalletMissing(false);
    
    if (selectedNetwork === 'stellar-mainnet') {
      const freighter = (window as any).freighterApi;
      if (!freighter) {
        setIsWalletMissing(true);
        return false;
      }
    } else if (selectedNetwork) {
      // Check for EVM wallet (simple check for window.ethereum)
      if (!(window as any).ethereum) {
        setIsWalletMissing(true);
        return false;
      }
    }
    return true;
  };

  const handleConnect = async () => {
    if (!selectedNetwork) return;
    setConnectionError(null);
    setIsConnecting(true);
    
    try {
      if (selectedNetwork === 'stellar-mainnet') {
        const freighter = (window as any).freighterApi;
        if (!freighter) {
          setIsWalletMissing(true);
          setIsConnecting(false);
          return;
        }
        
        try {
          // Request access to freighter
          const isAllowed = await freighter.isAllowed();
          if (!isAllowed) {
            await freighter.setAllowed();
          }
          const { address } = await freighter.getUserInfo();
          if (!address) throw new Error('No account found in Freighter');
          
          onConnect?.(selectedNetwork);
          onClose();
        } catch (e: any) {
          setConnectionError(`Stellar Connection Failed: ${e.message || 'Access denied by user'}`);
        }
      } else {
        // EVM networks
        try {
          // Find MetaMask or any injected connector
          const mmConnector = connectors.find(c => c.id === 'metaMaskSDK' || c.id === 'metaMask');
          const injectedConnector = connectors.find(c => c.type === 'injected');
          const connector = mmConnector || injectedConnector;

          if (!connector) {
            setIsWalletMissing(true);
            setIsConnecting(false);
            return;
          }

          await connectAsync({ connector });
          onConnect?.(selectedNetwork);
          onClose();
        } catch (e: any) {
          if (e.message?.includes('Connector not found') || e.message?.includes('Provider not found')) {
            setIsWalletMissing(true);
          } else {
            setConnectionError(`EVM Connection Failed: ${e.message || 'Failed to connect. Ensure MetaMask is unlocked.'}`);
          }
        }
      }
    } catch (e: any) {
      console.error('Wallet connection error:', e);
      setConnectionError(e.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const resetState = () => {
    setSelectedNetwork(null);
    setConnectionError(null);
    setIsWalletMissing(false);
  };

  React.useEffect(() => {
    if (selectedNetwork) {
      checkWalletAvailability();
    }
  }, [selectedNetwork]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl"
          >
            <Card className="p-8 sm:p-10 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-3xl bg-[#050508]/95 rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet className="w-40 h-40" />
              </div>

              <div className="flex justify-between items-center mb-8 relative">
                <div>
                  <h2 className="text-3xl font-bold font-display tracking-tight text-white uppercase italic">Protocol <span className="text-indigo-400">Gateway</span></h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Select Network & Connect Wallet</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-10 relative">
                {SUPPORTED_NETWORKS.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network.id)}
                    className={cn(
                      "w-full p-5 rounded-2xl border transition-all flex items-center gap-5 text-left group",
                      selectedNetwork === network.id 
                        ? "bg-indigo-500/10 border-indigo-500/40" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      selectedNetwork === network.id ? "bg-indigo-500 text-white" : cn(network.bg, network.color)
                    )}>
                      <network.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white text-base font-display">{network.name}</h4>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                          selectedNetwork === network.id ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
                        )}>{network.type}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{network.description}</p>
                    </div>
                    {selectedNetwork === network.id && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4 relative">
                <AnimatePresence mode="wait">
                  {isWalletMissing ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center"
                    >
                      <h4 className="text-amber-500 font-bold mb-2">Extension Required</h4>
                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        To use {SUPPORTED_NETWORKS.find(n => n.id === selectedNetwork)?.name}, you need the {selectedNetwork === 'stellar-mainnet' ? 'Freighter' : 'MetaMask'} browser extension.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 rounded-xl h-10 text-[11px]"
                          onClick={() => window.open(selectedNetwork === 'stellar-mainnet' ? 'https://www.freighter.app/' : 'https://metamask.io/download/', '_blank')}
                        >
                          Install Extension
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 rounded-xl h-10 text-[11px]"
                          onClick={() => setIsWalletMissing(false)}
                        >
                          Try Again
                        </Button>
                      </div>
                    </motion.div>
                  ) : connectionError ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center"
                    >
                      <h4 className="text-red-500 font-bold mb-2">Connection Blocked</h4>
                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        {connectionError}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full rounded-xl h-10 text-[11px]"
                        onClick={handleConnect}
                        isLoading={isConnecting}
                      >
                        Retry Protocol Handshake
                      </Button>
                    </motion.div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full h-16 rounded-2xl shadow-2xl shadow-indigo-600/20 group/btn"
                      disabled={!selectedNetwork}
                      isLoading={isConnecting}
                      onClick={handleConnect}
                    >
                      Initiate Secure Connection <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </AnimatePresence>
                
                <div className="flex items-center gap-3 justify-center">
                  <Shield className="w-3.5 h-3.5 text-slate-600" />
                  <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest text-center italic">Globe Thrift Secured Gateway</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
