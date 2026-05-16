import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Web3Provider } from './lib/web3';
import { WalletProvider as StellarWalletProvider } from './providers/WalletProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <StellarWalletProvider>
        <App />
      </StellarWalletProvider>
    </Web3Provider>
  </StrictMode>,
);
