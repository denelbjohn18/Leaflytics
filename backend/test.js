const { AnalysisService } = require('./dist/analysis/analysis.service.js');
const fs = require('fs');
const path = require('path');

async function run() {
  const service = new AnalysisService();
  service.logger = { log: console.log, error: console.error, warn: console.warn }; // mock logger
  global.fetch = require('node-fetch');
  try {
    const buffer = fs.readFileSync(path.join(process.cwd(), '../test.jpg'));
    const file = { buffer, mimetype: 'image/jpeg' };
    const res = await service.analyzeImage(file);
    console.log("Success:", res);
  } catch (e) {
    console.error("FAILED:", e);
  }
}
run();
