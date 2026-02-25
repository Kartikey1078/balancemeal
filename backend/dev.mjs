import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const distServer = resolve(projectRoot, 'dist/server.js');
const distKitchenReport = resolve(
  projectRoot,
  'dist/src/controllers/kitchenReportController.js'
);

const tsc = spawn('tsc', ['-p', 'tsconfig.json', '--watch'], {
  stdio: 'inherit',
});

let nodeProcess = null;

const startNode = () => {
  if (nodeProcess) return;
  if (!existsSync(distServer) || !existsSync(distKitchenReport)) return;
  nodeProcess = spawn('node', ['--watch', 'dist/server.js'], {
    stdio: 'inherit',
  });
  nodeProcess.on('exit', () => {
    nodeProcess = null;
    setTimeout(startNode, 500);
  });
};

const interval = setInterval(startNode, 500);

const shutdown = () => {
  clearInterval(interval);
  tsc.kill('SIGINT');
  if (nodeProcess) {
    nodeProcess.kill('SIGINT');
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
