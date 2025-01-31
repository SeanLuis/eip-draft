# DeFi Protocol Solvency Proof Implementation

## Prerequisites

- Node.js >= 16
- Git
- pnpm

## Project Setup

1. Install backend dependencies and compile contracts:
```bash
cd ..  # Go to root project directory
pnpm install
pnpm run compile
```

2. Start local Hardhat node:
```bash
pnpm run node
```

3. Deploy contracts (in a new terminal):
```bash
pnpm run deploy:local
```

4. Copy contract ABIs to frontend:
```bash
pnpm run copy:abis
```

5. Install frontend dependencies:
```bash
cd frontend
pnpm install
```

6. Start frontend development server:
```bash
pnpm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `pnpm run node` - Start local Hardhat node
- `pnpm run deploy:local` - Deploy contracts to local network
- `pnpm run copy:abis` - Copy contract ABIs from artifacts to frontend
- `pnpm run dev` - Start frontend development server
