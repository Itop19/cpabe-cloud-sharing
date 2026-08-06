const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const { encryptFile } = require('./services/cpabeService');

const sizes = [100 * 1024, 500 * 1024, 1024 * 1024, 5 * 1024 * 1024, 10 * 1024 * 1024];
const results = [];

async function run() {
  for (const size of sizes) {
    const buffer = Buffer.alloc(size, 'a');
    const start = performance.now();
    await encryptFile({ fileBuffer: buffer, policy: '(Department=CS AND Role=Student)', filename: 'bench.bin' });
    const elapsed = performance.now() - start;
    results.push({ sizeBytes: size, encryptionMs: elapsed });
  }

  const csv = ['sizeBytes,encryptionMs'].concat(results.map((r) => `${r.sizeBytes},${r.encryptionMs}`)).join('\n');
  fs.mkdirSync(path.join(__dirname, 'benchmark-output'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'benchmark-output', 'benchmarks.csv'), csv);
  fs.writeFileSync(path.join(__dirname, 'benchmark-output', 'benchmarks.json'), JSON.stringify({ results, cpuUsage: process.cpuUsage(), memoryUsage: process.memoryUsage() }, null, 2));
  console.log('Benchmark results written');
}

run().catch(console.error);
