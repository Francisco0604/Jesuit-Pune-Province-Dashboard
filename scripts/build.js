const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const tempApiDir = path.join(__dirname, '..', 'src', 'api_temp_disabled');

// 1. Run prebuild
console.log('--- Running prebuild static compiler ---');
try {
  require('./prebuild.js');
} catch (e) {
  console.error('Prebuild data compilation failed:', e);
  process.exit(1);
}

let renamed = false;
try {
  // 2. Temporarily rename api folder to prevent Next.js from compiling/failing on dynamic routes
  if (fs.existsSync(apiDir)) {
    console.log('--- Temporarily moving api routes out of App Router ---');
    fs.renameSync(apiDir, tempApiDir);
    renamed = true;
  }

  // Clean the .next cache to prevent type check validation errors on missing routes
  const nextCacheDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(nextCacheDir)) {
    console.log('--- Cleaning .next cache ---');
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
  }

  // 3. Run next build
  console.log('--- Executing next build ---');
  execSync('npx next build', { stdio: 'inherit', env: process.env });
  console.log('--- Build succeeded! ---');
} catch (error) {
  console.error('--- Build failed ---');
  process.exitCode = 1;
} finally {
  // 4. Restore the api folder
  if (renamed && fs.existsSync(tempApiDir)) {
    console.log('--- Restoring api routes ---');
    fs.renameSync(tempApiDir, apiDir);
  }
}
