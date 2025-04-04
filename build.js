
// Custom build script to ensure we use Vite for building
const { execSync } = require('child_process');
try {
  console.log('Building with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
