import { spawn } from 'child_process';
import { config } from '../config';

function startLocalValidator() {
  console.log('Starting local Solana validator...');
  
  const validator = spawn('solana-test-validator', [
    '--reset',
    '--rpc-port', '8899',
    '--bind-address', '0.0.0.0',
    '--quiet'
  ]);

  validator.stdout.on('data', (data) => {
    console.log(`Validator: ${data}`);
  });

  validator.stderr.on('data', (data) => {
    console.error(`Validator Error: ${data}`);
  });

  validator.on('close', (code) => {
    console.log(`Validator process exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down validator...');
    validator.kill();
    process.exit();
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down validator...');
    validator.kill();
    process.exit();
  });
}

startLocalValidator();
