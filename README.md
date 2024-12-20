# Cheshire Terminal Wallet

An AI-powered Solana wallet that uses local AI models via LM Studio to analyze transactions, discover optimal prices, and provide intelligent insights for secure trading.

## Features

- 🤖 Local AI model integration (Llama & Qwen) for transaction analysis
- 🔍 Real-time blockchain indexing and parsing
- 💱 AI-powered price discovery for optimal swaps
- 🔒 Secure transaction verification layer
- 📊 Transaction history analysis and insights
- 🌐 Local Solana validator integration

## Prerequisites

- Node.js (v16 or higher)
- Solana CLI tools
- LM Studio (for local AI models)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cheshire-terminal-wallet.git
cd cheshire-terminal-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```
PORT=3001
AI_MODEL_PATH=/path/to/your/llama-model.gguf
QEN_MODEL_PATH=/path/to/your/qwen-model.gguf
```

4. Download AI Models:
- Open LM Studio
- Download Llama 2 7B and Qwen models
- Note the paths to the downloaded models and update your .env file

## Usage

### Development Mode

Run the entire stack (React frontend, AI server, and local validator):
```bash
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- AI Server on http://localhost:3001
- Local Solana validator on http://localhost:8899

### Individual Components

Start components separately if needed:

1. Start the local Solana validator:
```bash
npm run start:validator
```

2. Start the AI server:
```bash
npm run start:server
```

3. Start the React frontend:
```bash
npm start
```

## Architecture

### Frontend
- React with TypeScript
- Solana Wallet Adapter integration
- Real-time transaction monitoring
- Price discovery interface

### Backend
- Express server with TypeScript
- AI model integration via LM Studio
- Blockchain indexing and parsing
- Transaction analysis engine

### AI Components
- Transaction risk analysis
- Price optimization
- Pattern recognition
- Market trend analysis

## API Endpoints

### Transaction Analysis
```
POST /api/analyze-transaction
Body: {
  instructions: TransactionInstruction[],
  signers: string[]
}
```

### Price Analysis
```
POST /api/analyze-price
Body: {
  inputToken: string,
  outputToken: string,
  amount: number
}
```

### Transaction History
```
GET /api/transactions
GET /api/transactions/:account
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

This wallet includes AI-powered security features, but always review transactions carefully before signing. The AI analysis is a tool to assist decision-making, not a guarantee of security.
