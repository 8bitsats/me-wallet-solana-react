import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
require('@solana/wallet-adapter-react-ui/styles.css');

function WalletContent() {
  const { publicKey, signTransaction, signMessage } = useWallet();

  async function analyzeTransaction() {
    try {
      const response = await fetch('http://localhost:3001/api/analyze-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructions: [],
          signers: [publicKey?.toString()]
        })
      });

      const analysis = await response.json();
      toast.success(`Analysis: ${analysis.explanation}`);
    } catch (error) {
      toast.error(`Error analyzing transaction: ${error}`);
    }
  }

  async function analyzePrices() {
    try {
      const response = await fetch('http://localhost:3001/api/analyze-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputToken: 'SOL',
          outputToken: 'USDC',
          amount: 1
        })
      });

      const analysis = await response.json();
      toast.success(`Price Analysis: ${analysis.recommendation}`);
    } catch (error) {
      toast.error(`Error analyzing prices: ${error}`);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-gray-200 text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">Cheshire Terminal Wallet</h1>
        {publicKey ? (
          <>
            <div className="mb-4">Connected: {publicKey.toString()}</div>
            <button
              onClick={analyzeTransaction}
              className="bg-[#e93a88] text-white rounded font-semibold px-4 py-2 mt-4"
            >
              Analyze Transaction
            </button>
            <button
              onClick={analyzePrices}
              className="bg-[#e93a88] text-white rounded font-semibold px-4 py-2 mt-4"
            >
              Analyze Prices
            </button>
          </>
        ) : (
          <WalletMultiButton />
        )}
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
