export const config = {
  // Solana Configuration
  SOLANA_VALIDATOR_URL: 'http://localhost:8899',
  SOLANA_WEBSOCKET_URL: 'ws://localhost:8900',
  
  // AI Model Configuration
  AI_MODEL_PATH: process.env.AI_MODEL_PATH || './models/llama-2-7b.gguf',
  QEN_MODEL_PATH: process.env.QEN_MODEL_PATH || './models/qwen.gguf',
  
  // Server Configuration
  PORT: process.env.PORT || 3001,
  
  // Blockchain Indexer Configuration
  MAX_TRANSACTION_HISTORY: 1000,
  INDEX_INTERVAL: 5000, // 5 seconds
  
  // Price Discovery Configuration
  PRICE_UPDATE_INTERVAL: 60000, // 1 minute
  DEX_ENDPOINTS: [
    'https://api.raydium.io/v2/main/price',
    'https://api.orca.so/v1/price',
  ],
}

export const modelConfig = {
  llama: {
    contextSize: 2048,
    threads: 4,
    temperature: 0.7,
    topP: 0.9,
  },
  qwen: {
    contextSize: 2048,
    threads: 4,
    temperature: 0.5,
    topP: 0.9,
  }
}
