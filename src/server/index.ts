import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { config } from './config';
import { aiAgent } from './services/aiAgent';
import { blockchainIndexer } from './services/blockchainIndexer';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(config.SOLANA_VALIDATOR_URL);

// Initialize services
async function initializeServices() {
  try {
    await aiAgent.initialize();
    await blockchainIndexer.start();
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
}

// API Routes

// Analyze transaction
app.post('/api/analyze-transaction', async (req, res) => {
  try {
    const { instructions, signers } = req.body;
    
    // Convert raw data back to Solana objects
    const txInstructions = instructions.map((ix: any) => ({
      ...ix,
      programId: new PublicKey(ix.programId),
      keys: ix.keys.map((key: any) => ({
        ...key,
        pubkey: new PublicKey(key.pubkey)
      }))
    }));

    const txSigners = signers.map((s: string) => new PublicKey(s));

    const analysis = await aiAgent.analyzeTransaction(txInstructions, txSigners);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    res.status(500).json({ error: 'Failed to analyze transaction' });
  }
});

// Get price analysis
app.post('/api/analyze-price', async (req, res) => {
  try {
    const { inputToken, outputToken, amount } = req.body;
    const analysis = await aiAgent.analyzePrices(inputToken, outputToken, amount);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing prices:', error);
    res.status(500).json({ error: 'Failed to analyze prices' });
  }
});

// Get transaction history
app.get('/api/transactions', (req, res) => {
  try {
    const history = blockchainIndexer.getTransactionHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// Get transactions by account
app.get('/api/transactions/:account', (req, res) => {
  try {
    const { account } = req.params;
    const transactions = blockchainIndexer.getTransactionsByAccount(account);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    res.status(500).json({ error: 'Failed to fetch account transactions' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    aiModel: aiAgent ? 'initialized' : 'not initialized',
    indexer: blockchainIndexer ? 'running' : 'stopped'
  });
});

// Start server
const PORT = config.PORT;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down services...');
  await blockchainIndexer.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down services...');
  await blockchainIndexer.stop();
  process.exit(0);
});
