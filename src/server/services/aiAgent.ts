import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { config, modelConfig } from '../config';
import fetch from 'node-fetch';

interface TransactionAnalysis {
  risk: number;
  explanation: string;
  recommendation: string;
}

interface PriceAnalysis {
  bestPrice: number;
  confidence: number;
  recommendation: string;
}

export class AIAgent {
  private connection: Connection;
  private apiUrl: string;

  constructor() {
    this.connection = new Connection(config.SOLANA_VALIDATOR_URL);
    this.apiUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234';
  }

  async initialize() {
    try {
      // Test connection to LM Studio
      const response = await fetch(`${this.apiUrl}/v1/models`);
      if (!response.ok) {
        throw new Error('Failed to connect to LM Studio');
      }
      console.log('Connected to LM Studio successfully');
    } catch (error) {
      console.error('Error connecting to LM Studio:', error);
      throw error;
    }
  }

  private async queryLMStudio(prompt: string) {
    try {
      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: process.env.LM_STUDIO_MODEL || 'llama-3.2-3b-instruct',
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from LM Studio');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error querying LM Studio:', error);
      throw error;
    }
  }

  async analyzeTransaction(
    instructions: TransactionInstruction[],
    signers: PublicKey[]
  ): Promise<TransactionAnalysis> {
    const txContext = await this.buildTransactionContext(instructions, signers);
    
    // Format prompt for transaction analysis
    const prompt = `
      Analyze this Solana transaction:
      ${JSON.stringify(txContext, null, 2)}
      
      Provide:
      1. Risk assessment (0-100)
      2. Explanation of the transaction
      3. Recommendation for the user
    `;

    try {
      const response = await this.queryLMStudio(prompt);
      
      // Parse the AI response
      const lines = response.split('\n');
      let risk = 0;
      let explanation = '';
      let recommendation = '';

      for (const line of lines) {
        if (line.startsWith('1.')) {
          risk = parseInt(line.split(':')[1]) || 0;
        } else if (line.startsWith('2.')) {
          explanation = line.split(':')[1]?.trim() || '';
        } else if (line.startsWith('3.')) {
          recommendation = line.split(':')[1]?.trim() || '';
        }
      }

      return {
        risk,
        explanation,
        recommendation
      };
    } catch (error) {
      console.error('Error analyzing transaction:', error);
      throw error;
    }
  }

  async analyzePrices(
    inputToken: string,
    outputToken: string,
    amount: number
  ): Promise<PriceAnalysis> {
    const priceContext = await this.buildPriceContext(inputToken, outputToken, amount);
    
    const prompt = `
      Analyze these DEX prices:
      ${JSON.stringify(priceContext, null, 2)}
      
      Provide:
      1. Best available price
      2. Confidence in the price (0-100)
      3. Recommendation for timing
    `;

    try {
      const response = await this.queryLMStudio(prompt);
      
      // Parse the AI response
      const lines = response.split('\n');
      let bestPrice = 0;
      let confidence = 0;
      let recommendation = '';

      for (const line of lines) {
        if (line.startsWith('1.')) {
          bestPrice = parseFloat(line.split(':')[1]) || 0;
        } else if (line.startsWith('2.')) {
          confidence = parseInt(line.split(':')[1]) || 0;
        } else if (line.startsWith('3.')) {
          recommendation = line.split(':')[1]?.trim() || '';
        }
      }

      return {
        bestPrice,
        confidence,
        recommendation
      };
    } catch (error) {
      console.error('Error analyzing prices:', error);
      throw error;
    }
  }

  private async buildTransactionContext(
    instructions: TransactionInstruction[],
    signers: PublicKey[]
  ) {
    // Build context about the transaction for AI analysis
    return {
      instructions: instructions.map(ix => ({
        programId: ix.programId.toString(),
        keys: ix.keys.map(key => ({
          pubkey: key.pubkey.toString(),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        data: ix.data.toString()
      })),
      signers: signers.map(s => s.toString()),
      timestamp: new Date().toISOString()
    };
  }

  private async buildPriceContext(
    inputToken: string,
    outputToken: string,
    amount: number
  ) {
    // Fetch prices from configured DEX endpoints
    // This will be implemented with actual DEX API calls
    return {
      input: inputToken,
      output: outputToken,
      amount,
      prices: [],
      marketConditions: "Pending implementation"
    };
  }
}

export const aiAgent = new AIAgent();
