/**
 * Production Deployment Script
 * 
 * This script helps with production deployment tasks.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message: string, color = GREEN) {
  console.log(`${color}${message}${RESET}`);
}

function runCommand(command: string, description: string) {
  log(`\n${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    log('Done!', GREEN);
  } catch (error) {
    log(`Failed: ${error}`, RED);
    process.exit(1);
  }
}

async function checkPrerequisites() {
  log('\n=== Checking Prerequisites ===');
  
  const checks = [
    { command: 'node --version', name: 'Node.js', minVersion: '18.0.0' },
    { command: 'bun --version', name: 'Bun', minVersion: '1.0.0' },
    { command: 'psql --version', name: 'PostgreSQL Client', minVersion: '14.0.0' },
  ];

  for (const check of checks) {
    try {
      const version = execSync(check.command, { encoding: 'utf-8' }).trim();
      log(`✓ ${check.name}: ${version}`);
    } catch {
      log(`✗ ${check.name} not found`, YELLOW);
    }
  }
}

async function validateEnvironment() {
  log('\n=== Validating Environment Variables ===');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'ENCRYPTION_KEY',
    'SENTRY_DSN',
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    log(`✗ Missing required environment variables:`, RED);
    missingVars.forEach(v => log(`  - ${v}`));
    log('\nPlease copy .env.production.example to .env and fill in the values.', YELLOW);
    process.exit(1);
  }

  log('✓ All required environment variables are set');
}

async function runDatabaseMigrations() {
  log('\n=== Running Database Migrations ===');
  runCommand('bun run db:migrate', 'Running database migrations');
}

async function buildApplication() {
  log('\n=== Building Application ===');
  runCommand('bun run build', 'Building application');
}

async function runTests() {
  log('\n=== Running Tests ===');
  runCommand('bun test', 'Running tests');
}

async function deployToCloudflare() {
  log('\n=== Deploying to Cloudflare Workers ===');
  
  // Check if wrangler is installed
  try {
    execSync('wrangler --version', { encoding: 'utf-8' });
  } catch {
    log('Installing Wrangler...', YELLOW);
    execSync('npm install -g wrangler', { stdio: 'inherit' });
  }

  runCommand('bun run wrangler deploy', 'Deploying to Cloudflare');
}

async function setupMonitoring() {
  log('\n=== Setting Up Monitoring ===');
  
  // Initialize Sentry
  log('Sentry monitoring is configured via SENTRY_DSN environment variable.');
  log('Make sure to create a release in Sentry for your deployment.');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';

  log('Healthcare SaaS Production Deployment Script', GREEN);
  log('='.repeat(50));

  switch (command) {
    case 'check':
      await checkPrerequisites();
      break;
    case 'validate':
      await validateEnvironment();
      break;
    case 'migrate':
      await validateEnvironment();
      await runDatabaseMigrations();
      break;
    case 'build':
      await validateEnvironment();
      await buildApplication();
      break;
    case 'test':
      await runTests();
      break;
    case 'deploy':
      await validateEnvironment();
      await runDatabaseMigrations();
      await runTests();
      await buildApplication();
      await deployToCloudflare();
      await setupMonitoring();
      break;
    case 'cloudflare':
      await deployToCloudflare();
      break;
    default:
      log(`Unknown command: ${command}`, RED);
      log('Usage: node deploy.js [check|validate|migrate|build|test|deploy|cloudflare]');
      process.exit(1);
  }

  log('\n=== Deployment Complete ===', GREEN);
}

main().catch(error => {
  log(`Error: ${error}`, RED);
  process.exit(1);
});
