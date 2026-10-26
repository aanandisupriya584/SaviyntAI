const { defineConfig } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const state = path.resolve('logs', `test-state-${process.pid}`);
fs.mkdirSync(state, { recursive: true });

module.exports = defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: 'http://127.0.0.1:3103',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node server/server.cjs',
    url: 'http://127.0.0.1:3103/api/health',
    timeout: 60000,
    reuseExistingServer: false,
    env: {
      PORT: '3103', HOST: '127.0.0.1',
      DATA_DIR: path.join(state, 'data'),
      DOCS_DIR: path.join(state, 'documents'),
      LOGS_DIR: path.join(state, 'logs'),
    },
  },
});
