import { 
  Connection, 
  PublicKey, 
  ConfirmedTransaction, 
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo
} from '@solana/web3.js';
import { config } from '../config';

interface IndexedTransaction {
  signature: string;
  timestamp: number;
  blockTime: number;
  slot: number;
  fee: number;
  status: string;
  programIds: string[];
  accounts: string[];
  type: string;
  amount?: number;
  tokenInfo?: {
    mint: string;
    decimals: number;
    symbol?: string;
  };
}

export class BlockchainIndexer {
  private connection: Connection;
  private transactionHistory: Map<string, IndexedTransaction>;
  private isIndexing: boolean;
  private lastProcessedSlot: number;

  constructor() {
    this.connection = new Connection(config.SOLANA_VALIDATOR_URL);
    this.transactionHistory = new Map();
    this.isIndexing = false;
    this.lastProcessedSlot = 0;
  }

  async start() {
    if (this.isIndexing) return;
    this.isIndexing = true;
    
    try {
      // Get the current slot as starting point
      this.lastProcessedSlot = await this.connection.getSlot();
      console.log(`Starting indexer from slot ${this.lastProcessedSlot}`);
      
      this.startIndexing();
    } catch (error) {
      console.error('Error starting indexer:', error);
      this.isIndexing = false;
    }
  }

  private async startIndexing() {
    while (this.isIndexing) {
      try {
        await this.processNewTransactions();
        await new Promise(resolve => setTimeout(resolve, config.INDEX_INTERVAL));
      } catch (error) {
        console.error('Error in indexing loop:', error);
      }
    }
  }

  private async processNewTransactions() {
    try {
      const currentSlot = await this.connection.getSlot();
      
      if (currentSlot <= this.lastProcessedSlot) {
        return;
      }

      const signatures = await this.connection.getSignaturesForAddress(
        new PublicKey('11111111111111111111111111111111'), // System program to get all transactions
        {
          limit: 100,
          before: this.lastProcessedSlot.toString()
        }
      );
      
      for (const sigInfo of signatures) {
        if (sigInfo.slot > this.lastProcessedSlot) {
          await this.indexTransaction(sigInfo);
        }
      }

      this.lastProcessedSlot = currentSlot;
      this.pruneOldTransactions();
      
    } catch (error) {
      console.error('Error processing transactions:', error);
    }
  }

  private async indexTransaction(sigInfo: ConfirmedSignatureInfo) {
    try {
      const tx = await this.connection.getParsedTransaction(sigInfo.signature);
      if (!tx) return;

      const indexed = await this.parseTransaction(tx, sigInfo.signature);
      this.transactionHistory.set(sigInfo.signature, indexed);
      
    } catch (error) {
      console.error(`Error indexing transaction ${sigInfo.signature}:`, error);
    }
  }

  private async parseTransaction(
    tx: ParsedTransactionWithMeta,
    signature: string
  ): Promise<IndexedTransaction> {
    const programIds = tx.transaction.message.instructions.map(
      ix => ix.programId.toString()
    );

    const accounts = tx.transaction.message.accountKeys.map(
      key => key.pubkey.toString()
    );

    return {
      signature,
      timestamp: Date.now(),
      blockTime: tx.blockTime || 0,
      slot: tx.slot,
      fee: tx.meta?.fee || 0,
      status: tx.meta?.err ? 'failed' : 'success',
      programIds,
      accounts,
      type: this.determineTransactionType(programIds),
    };
  }

  private determineTransactionType(programIds: string[]): string {
    // Add logic to determine transaction type based on program IDs
    // This can be expanded based on known program IDs
    if (programIds.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
      return 'TOKEN_TRANSFER';
    }
    if (programIds.includes('11111111111111111111111111111111')) {
      return 'SOL_TRANSFER';
    }
    return 'UNKNOWN';
  }

  private pruneOldTransactions() {
    const entries = Array.from(this.transactionHistory.entries());
    if (entries.length > config.MAX_TRANSACTION_HISTORY) {
      // Sort by timestamp and remove oldest entries
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const toKeep = entries.slice(0, config.MAX_TRANSACTION_HISTORY);
      this.transactionHistory = new Map(toKeep);
    }
  }

  async stop() {
    this.isIndexing = false;
  }

  getTransactionHistory(): IndexedTransaction[] {
    return Array.from(this.transactionHistory.values());
  }

  getTransactionsByAccount(account: string): IndexedTransaction[] {
    return Array.from(this.transactionHistory.values()).filter(tx =>
      tx.accounts.includes(account)
    );
  }

  getTransactionsByType(type: string): IndexedTransaction[] {
    return Array.from(this.transactionHistory.values()).filter(tx =>
      tx.type === type
    );
  }
}

export const blockchainIndexer = new BlockchainIndexer();
