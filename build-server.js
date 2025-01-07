import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildServer() {
  try {
    await build({
      entryPoints: ['src/server.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/index.js',
      external: [
        // External dependencies that should not be bundled
        'express',
        'drizzle-orm',
        '@octokit/rest',
        'openai',
        'ws',
        // Add other production dependencies here
      ],
    });
    console.log('Server build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildServer();